# sim-dawnbid-a — PREREG (binding)

Run: fleshout-20261116T0315Z (Loop A), axis scale-onramp, arm
sim-dawnbid-a — DIAG: the dawn-candidate diagnostic for the wave-4
re-engagement chain (sim-findings #2404). Branch `sim-dawnbid-a`
(worktree `~/workspace/worktrees/sim-dawnbid-a`). Base: master
`6ca37144b` at arm start. Binding prereg: THIS file — frozen before
any judged sim. The instrument (driver, analyzer, proof test) is
built AFTER this commit; no judged numbers exist yet.

## The question, in plain words

The vetparty lever (evidence/2026-11-15/sim-vetparty-a.md, PILOT
NO-GO) proved the seed fires but the chain dies at dawn: **106
seeded wave-4+ flee plans across 8 seeds, only ONE produces a
wave-4 depart row.** The recorder could not tell "dawn never bid
the party_launch candidate" from "plan churned before dawn".
This DIAG builds the candidate-bid capture in the dawn scorer
and measures the decomposition: for every seeded wave-4 plan,
at each dawn, was the party_launch candidate bid, its score/rank
if bid, was it selected, and if selected but no depart resulted,
which launch condition blocked it — versus the plan churning
before dawn ever saw it.

## Prior art (read first)

- `evidence/2026-11-15/sim-vetparty-a.md` + prereg — the 106-seed
  result, the armed/control corpora
  (`perseed-vetparty-a-control`, `perseed-vetparty-a-on`), the
  drift-check pattern, the T-class instrument.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md` (wave 4
  "The Mirror Draft": standing ≥ 100; readiness wave 4: 3 armored
  P≥10, 5 armed, 3 tricks, 1 wave-3+ killer — the bar this chain
  feeds, not changes), `docs/VILLAGER-BRAIN.md` (one-brain
  contract: Phase 1 dawn scorer; drive candidates as scorer
  candidates; the brain owns dawn).

## Design decision 1 — the subject only exists with the seed call (frozen)

Verified on this tree before this prereg: on current master the
world-tick seed call is GONE (it was vetparty lever touch point
1, reverted by commit `7ba893b4b`). The vetparty CONTROL leg
(lever absent) therefore saw **1 wave-4 seed in 8 seeds** (seed
100827), against 106 on the armed leg — the `winPlanSeedFromFight`
call sites left on master are only the gate-'avoided' path
(`win-plan.js:512`) and the expedition path. A DIAG run on pure
master would classify ~0 plans: a vacuous result.

So the instrument leg re-lands **ONLY the vetparty seed call,
verbatim** (the 13-line block removed by `7ba893b4b` in
`resolveWildMonsterEncounter`, `src/js/game.js`, beside the
existing return-to-fight sighting block): after a `fieldFight` /
`aidFight` vs a wave-4+ monster ending `vFlee`, call
`winPlanSeedFromFight(vid, mdef, 'fled')`; excluded for raids
(`opts.raid`) and aid fights (`wViaAid`); wave-gated inside the
seed (wave ≥ 3). This is a DIAG reproduction of the subject, NOT
a balance change: it changes no number, no bar, no gate, no
price, no default. The lever's other touch points stay reverted:
no party shape / second companion (`win-plan.js`), no gate
counting, no dissolution, no brain `companion2` mirror. The
seed→dawn→depart chain is the same chain the armed leg measured
(the lever's other touch points affect party composition and
gate counting, not whether a depart row is produced — the
launch decision itself is `findCompanion` + the launchability
gates, which the lever did not change).

Disposition (vetparty precedent): after measurement the seed
call is REVERTED on the branch; the instrument, analyzer, proof
test, corpora, and evidence merge evidence-only. The seed-call
text is preserved verbatim in this prereg and in git history
(commit `f0fb6fc18`), so any follow-up re-lands it in one step.

## Design decision 2 — the bid capture needs NO game-code hook (frozen)

Scouted before this prereg: the dawn scorer's full candidate
list passes through the Game method `vbrainScorePick(vid, cands,
opts)` (called from `objPick` after `vbrainFeedExtras` appends
the win-plan candidates), and the pick is written to the commit
(`vbrainCommit`) and the log (`vbrainLastLog`). The driver wraps
`vbrainScorePick` — a pure read of the argument + the commit/log
after the call — and records every scoring call. No hook is added
to `winPlanCands` (module-internal) or to the scorer. The only
game-code touch in this arm is the seed call of Decision 1.

Structural facts the classifier relies on (read from the code,
not assumed — see §"Frozen definitions"):

- `winPlanCands` returns at most ONE win-plan candidate. Stage
  `gear` + unarmed/unarmored → `gear_hold`; stage `table` +
  wave-4 killer + no companion → `veteran_guard`; stage
  party/hunt/standing/table + companion → `party_launch` (w 5.0);
  stage `party` + no companion → `party_wait` (w 4.0); stage
  hunt/standing/table + NO companion → NO win-plan candidate at
  all.
- `vbrainScorePick` lets the FIRST win-plan extra override the
  core lottery, so a bid `party_launch` is structurally selected
  whenever it is bid (the `bid-not-selected` bucket is expected
  near 0 — a non-zero count would mean a second selection path
  exists and must be named in the evidence).
- The brain executor `vbrainExecuteDepart` is THE depart path:
  all 90 armed-leg depart rows came from it, 0 from the fallback
  `winPlanDepart`. It does NOT re-check the launch conditions
  the fallback path checks (companion gear-up, sick, range-0,
  hurt<70 + medicine/healer); it calls `startExpedition` for
  the inviter and, if that starts, for the companion — and it
  does NOT verify the companion's expedition started. So a
  `party_launch` selection can produce a `launch` row with the
  companion left behind, and a `hold` only when the INVITER's
  own `startExpedition` refuses (hurt + no medicine + no healer
  via `villagerHealCheck`, sick, range-0). The driver therefore
  derives the blocker by pure reads AFTER the execute call:
  inviter/companion expedition presence + the read-only
  launchability replica (sick / range-0 / hurt<70 + no usable
  medicine + no camp healer — replicating the fallback path's
  pure-read rule, NEVER calling `villagerHealCheck`, which
  spends medicine).
- `objPick` is called at dawn (dayPart 0) and on mid-day
  refresh (`objRefreshPick`, only when the commit is stale or a
  perception flag fired). The analyzer treats part 0 rows as
  dawn; all parts are recorded, and a dawn `party_launch`
  commit overwritten mid-day before execution is recorded as
  sub-reason `commit-overwritten-midday` under
  `selected-blocked` if observed.

## The instrument (frozen)

- Driver: `scripts/dawnbid-driver-20261115.js` (new — the
  vetparty driver extended, not rebuilt: same vetfirst T-class
  instrument, same `v4seeds` / `v4departs` / `v4gates` /
  `v4encounters` recorder, PLUS the dawnbid rows below and a
  daily plan census). Recorder wraps are pure reads plus writes
  to driver-local arrays — no game-state writes, no RNG. The
  driver refuses to overwrite an existing per-seed file.
  `DAWNBID_RECORDER=off` skips installing the wraps (used by
  determinism leg D2).
- Dawnbid rows (per `vbrainScorePick` call): `dawnbidScores` —
  {day, part, vid, cands: [{kind, w, winPlanAction, companion,
  vbrainSrc}], pick: {kind, winPlanAction, override, corePick},
  commit: {kind, winPlanAction, companion}, plan: {stage,
  target, needWave, party} (holder's plan at scoring time, if
  any), holderGear: {armed, armored}}.
- Extended depart rows: `dawnbidDeparts` — per
  `vbrainExecuteDepart` call for a plan holder: {day, vid,
  source, result, winPlanAction, companion, vidExped,
  companionExped, vidBlock, companionBlock, stage, target,
  party}. `vidBlock` / `companionBlock` are the derived
  launch-condition names (or null when the expedition started).
- Daily plan census: `dawnbidCensus` — once per day (in the
  policy.daily wrapper, same point as the T-class snapshot),
  for each `winPlan` entry with target in the wave-4 set or
  `needWave >= 4`: {day, vid, target, needWave, stage, party,
  holderAlive, holderNode, holderExped, holderSick,
  holderHealth, holderGear}.
- Analyzer: `scripts/analyze-dawnbid-a.js` (new). Classifies
  plan instances from the corpora (definitions below), prints
  the bucket table + sub-reason breakdowns + per-seed table +
  wall numbers, writes
  `evidence/2026-11-15/dawnbid-a-analysis.json`, exits non-zero
  on any `unknown` instance.
- Drift check: reuse `scripts/vetparty-drift-check.js` verbatim
  (it reads `v4seeds` + the T-class daily fingerprints — this
  driver's corpora carry both). First divergence must fall
  on/after the first `v4seeds` day per seed.
- Proof: `scripts/test-dawnbid-a.js` (new; see below). GREEN on
  the instrument tip before the instrument leg runs; GREEN
  again post-revert with `DAWNBID_SEED_CALL=off` (not-built
  shape).

## Frozen definitions

- **Wave-4 monster ids** (from `src/data/monsters.json`, wave 4;
  10, re-read live by the driver): `congregation`, `strike`,
  `influencer`, `audit`, `reunion`, `suburb`, `eulogy`,
  `algorithm`, `eater`, `herald`. (Doc drift carried from
  vetparty: `docs/MONSTER-WAVES.md` lists 9, no herald; the
  data has 10 and the data rules.)
- **A seeded wave-4 plan instance** opens on a `v4seeds` row
  with wave ≥ 4 whose holder does NOT already hold a live
  wave-4 plan (same vid, same target = a refresh, counted
  once, refresh count recorded; a later seed row for the same
  vid with a DIFFERENT target while the old instance is still
  open closes the old instance as `churned-retargeted` and
  opens a new instance). A seed row that arrives while the
  holder's plan is at stage hunt/standing/table opens NOTHING
  (`winPlanSeedFromFight` returns the plan unchanged) — it is
  recorded as a non-opening seed, not a plan instance. The
  denominator for the primary metric is plan instances opened,
  not seed calls; both numbers are reported.
- **Churn** (plan ends before its first scored dawn after
  seeding): holder died; plan deleted (`tableActive`); stage
  advanced out of {gear, party} without a launch (kill →
  standing via `winPlanNoteKill`; fifth-draft beat + veteran →
  table via `winPlanHavenTick`); retargeted (above). Churn
  AFTER the first scored dawn is not `plan-churned-before-dawn`
  — the plan had its dawn chance and its fate is decided by
  its bid history (see precedence).
- **Scored dawn**: a `dawnbidScores` row with part 0 for the
  holder while the plan instance is live.
- **Buckets — exactly one per plan instance, precedence in
  this order (first match wins):**
  1. `launched` — a dawn `party_launch` commit for the instance
     AND the execute call started expeditions for BOTH the
     inviter and the companion (a `launch` row with the
     companion left behind is NOT launched — it is
     `selected-blocked` with sub-reason
     `companion-not-started`).
  2. `selected-blocked` — a dawn `party_launch` commit with no
     launch resulting. Sub-reason (named): `inviter-hurt`
     (hurt <70HP, no medicine, no healer),
     `inviter-sick`, `inviter-range-0`,
     `companion-not-started` (+ companion-side derived reason:
     `companion-sick` / `companion-range-0` /
     `companion-hurt` / `companion-unknown`),
     `commit-overwritten-midday`, `inviter-exped-failed-unknown`.
  3. `bid-not-selected` — `party_launch` bid at ≥1 scored dawn
     but never the commit.
  4. `plan-churned-before-dawn` — churn (above) before the
     first scored dawn after seeding. Sub-reason named
     (holder-died / plan-deleted / stage-advanced /
     retargeted).
  5. `candidate-not-bid` — ≥1 scored dawn while live, `party_launch`
     never bid, no churn before the first scored dawn.
     Sub-reason from the bid history (most frequent first):
     `gear-stage` (gear_hold bid), `no-companion-party`
     (party_wait bid), `no-companion-hunt-plus` (no win-plan
     candidate at all), `not-scored` (0 scored dawns observed
     while live — e.g. seeded in the final days; still
     classified, with the dawn count recorded).
  6. `unknown` — fits none of the above (analyzer bug). Must be
     0. Any instance the analyzer cannot place lands here and
     fails the run.
- **Instrument error:** any non-empty `instrumentErrors`, any
  per-seed file failing to parse, any seed whose unlock/kill
  fields disagree (same rule as the vetparty prereg).

## Primary metric + GO bar (frozen)

Primary metric: **share of seeded wave-4 plan instances
classified into exactly one bucket** (the five above; the
task's four named buckets are the failure decomposition and
`launched` is the success bucket — the one launcher in the
prior art must be accounted for, or the 0%-unknown bar is
unmeetable).

GO (instrument validity) iff ALL hold:

1. **≥90% of seeded plan instances classified, 0% in
   `unknown`.** (Five buckets cover all terminals, so 100% is
   expected; the 90% bar allows analyzer-edge misses, but
   `unknown` must be exactly 0.)
2. **Corpus 16/16 files parse** (8 control + 8 instrument
   legs, identical seeds).
3. **Neutrality proven:** drift smoke clean (no pre-seed
   divergence on any seed) AND determinism legs green (D1 +
   D2 below).
4. **Proof test `scripts/test-dawnbid-a.js` green.**

This is a DIAG: GO means the instrument is valid and the
decomposition is measured. It is NOT a lever GO — no game
change is judged, and nothing ships from this arm except the
instrument + evidence.

## Secondary (reported, not judged)

- Bucket shares + counts (per bucket and sub-reason); the
  decomposition table the next lever arm reads first.
- Per-seed table: plan instances opened, seed calls, bid rate
  (scored dawns with a bid / scored dawns), selections,
  launches, churns, departs by size.
- Wall numbers (both legs): national / table / wins, wave-4/5
  unlocks, median survival.
- Sense check: quote 2–3 wave-4 fight lines (`log[]`) from the
  instrument leg and judge whether the fights read like fights
  (vetparty found `lines[]` empty, `log[]` live — quote `log[]`).

## Seed bands (verified fresh per the seed-band-freshness skill)

- Pilot: **100861–100868** (8 seeds), control leg first
  (recorder only, prereg tip — no seed call), then instrument
  leg (seed call + recorder, instrument tip), identical seeds,
  same policy/horizon.
- **Shared with sibling arm sim-ammocensus-a** (also a neutral
  recorder, same run, same seeds) — noted here per the task
  brief. Sharing is safe: both arms are observation-only and
  write disjoint per-seed directories
  (`perseed-dawnbid-a-*` vs the sibling's own).
- NEVER 100521–100536 (gorgeprice2 CONFIRM), 190391–190398
  (7redef/guardablate), 190621–190628 (2b-fresh),
  190631–190638 (guardablate-fresh), 190541–190548,
  190561–190568 (task-forbidden bands). Confirm band NOT
  spent: this is a DIAG pilot; no confirm exists for an
  instrument.
- Freshness check (2026-11-15, re-verified by this arm before
  this commit — scope and result): zero hits for `10086[0-9]`
  and for the exact seeds 100861–100868 in (a) all `*.md`
  under `evidence/` (every dated prereg, evidence file, and
  note), (b) `scripts/*.js` (driver band literals), (c)
  per-seed filenames under `evidence/` (no `10086*` file),
  (d) the goal `hidden_files/` tracker, lever-claims, and
  findings `.md` (rg for the exact seed numbers: no match).
  A broad substring sweep over goal `hidden_files/` returns
  only decimal-fragment false positives (e.g. pantry floats
  inside old October corpus JSON, single-line files) and zero
  seed-band usage — the same class the coordinator reported.
  Neighbouring used bands: 100821–100828 (vetparty pilot),
  100841–100856 (vetparty confirm, reserved — NOT used here).

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop
  simulating), policy **competent verbatim**
  (`scripts/policies/competent.js`, sha `74a890f0844e` —
  verified by this arm with sha256sum before this commit; the
  driver's own-policy record carries the sha it ran under).
  The standing fix marker (`ROSTER CHECK`) is present in
  `src/js/standing.js` on this tree — no swap is needed.
- Control leg on the prereg tip (this commit; the anchor SHA
  is recorded in the evidence file, not here — the frozen rule
  is "control = prereg tip"). Instrument leg on the instrument
  tip (seed call added, proof green). Identical seeds.
- **Sibling-file note:** the instrument leg touches
  `src/js/game.js` (13-line seed-call insertion at
  `resolveWildMonsterEncounter`). The sibling arm
  sim-ammocensus-a has no divergent commits at arm start
  (`git diff master...sim-ammocensus-a` empty), but if it
  touches `src/js/game.js` the coordinator must sequence the
  merges (rebase one onto the other). All other dawnbid files
  are new names under `scripts/dawnbid-*` and
  `evidence/2026-11-15/*dawnbid*` — no overwrite of the
  vetparty instrument files.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** instrument tip, seed 100861, 60d,
  recorder ON, run twice → identical per-seed JSON
  (deaths/days/endReason/vet5 + all dawnbid rows identical).
- **D2 (wrap neutrality):** instrument tip, seed 100861, 60d,
  recorder ON vs recorder OFF (`DAWNBID_RECORDER=off`) →
  identical trajectories (deaths/days/endReason/standing/vet5
  + daily fingerprints). The seed call is game code, not a
  wrap, so it is present in both legs — D2 isolates the
  wraps only.
- **D3 (drift smoke):** `scripts/vetparty-drift-check.js` over
  the two corpora — first divergence on/after the first
  `v4seeds` day per seed; NO PRE-SEED DRIFT. (The seed call
  is the instrument's first possible divergence cause, so the
  smoke's "first lever-action day" is the first `v4seeds`
  day, exactly as in the vetparty arm.)

## Proof test

`scripts/test-dawnbid-a.js` proves, on synthetic fixtures and
live in-memory runs (no corpus numbers):

- Static: the seed call is present in `src/js/game.js`
  (verbatim VETPARTY block) when `DAWNBID_SEED_CALL=on`
  (default), absent when `off` (post-revert shape — the check
  records "not-built-yet", it does not crash); the driver
  wraps exist (`vbrainScorePick`, `vbrainExecuteDepart`,
  `winPlanSeedFromFight`, `startExpedition` — driver-side);
  the diff for game code touches exactly `src/js/game.js`
  (the seed call only); the wave-4 id set matches
  `src/data/monsters.json` wave 4 exactly (10 ids).
- Unit (classifier, synthetic fixtures): one fixture per
  bucket — launched (bid + selected + both expeditions);
  selected-blocked × each named sub-reason (inviter-hurt,
  inviter-sick, inviter-range-0, companion-not-started with a
  companion-side reason, commit-overwritten-midday);
  bid-not-selected; plan-churned-before-dawn × each churn
  sub-reason; candidate-not-bid × each sub-reason (gear-stage,
  no-companion-party, no-companion-hunt-plus, not-scored);
  precedence (blocked-then-launched → launched;
  never-bid-then-churned-after-first-dawn → candidate-not-bid);
  retarget closes the old instance and opens a new one;
  same-target re-seed refreshes (one instance);
  non-opening seed at hunt stage opens nothing.
- Recorder: synthetic fixtures for the three dawnbid row
  shapes (score / depart / census); a live in-memory run
  proves the `vbrainScorePick` wrap records the bid + pick
  without changing the pick.
- Determinism: D1 as frozen above (seed 100861, 60d, twice —
  identical deaths/days/endReason/vet5 + identical dawnbid
  rows).
- GREEN on the instrument tip before the instrument leg runs;
  GREEN again post-revert with `DAWNBID_SEED_CALL=off`.

## Sense-testing

Quote the wave-4 fight lines the recorder captures
(`v4encounters[].log[]`) for 2–3 wave-4 fights in the
instrument leg and judge whether the fights read like fights
— and whether the PARTY reads like a party. Name the fight
lines' source (seed, day, fighter, monster) and the counts
searched. Do not invent fight narrative from kill counts.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 4 "The Mirror Draft"
  (standing ≥ 100; bands damage 35–95, HP 850–1500, pierce
  0.2–0.5; readiness wave 4: 3 armored P≥10, 5 armed, 3
  tricks, 1 wave-3+ killer). Wave 5 "The Producers" (standing
  ≥ 200 AND wave-4 faced). Doc drift noted: the doc lists 9
  wave-4 monsters; the data has 10 (herald).
- `docs/PARTY.md` — the party concept this chain test-cases.
- `docs/VILLAGER-BRAIN.md` — the one-brain contract: Phase 1
  (dawn scorer; drive candidates as scorer candidates),
  §9 (win prices / deed gates / readiness bars untouched;
  perception law).
- Prior evidence: `evidence/2026-11-15/sim-vetparty-a.md`
  (§"Mechanism decomposition" — this DIAG's subject) and
  `evidence/2026-11-15/sim-vetparty-a-prereg.md` (definitions
  reused; the seed call, the launch conditions, the gate
  bars); `evidence/2026-11-15/sim-scale-onramp-round-0115.md`
  (coordinator evidence — vetparty PILOT NO-GO; next blank #8:
  survivorship needs a lever aimed at launch conditions).

## Correction 2 (2026-11-15, before any judged sim — control leg not yet run)

**C2 — stage advancement is NOT churn; two terminals added.**
Re-reading `winPlanCands` after freezing: a plan at stage
`standing` or `table` WITH a companion still bids
`party_launch` — the stage advance (kill → standing via
`winPlanNoteKill`; fifth-draft beat + veteran → table via
`winPlanHavenTick`) does not end the plan's launchability, so
it must not close the instance. Stage transitions
(gear→party→standing→table) are recorded as instance history,
not churn. **Churn kinds are only: holder-died,
plan-deleted, retargeted.** The `plan-churned-before-dawn`
bucket keeps its meaning (churn before the first scored dawn
after seeding) with the narrowed kind list.

Two terminals the frozen definitions missed:

- **`target-killed` (new bucket):** the holder slew the
  plan's target type outside a party launch (verified via
  `waveKillLog`: an entry by the holder with mid === target
  while the instance is open), closing the instance — the
  plan's purpose is fulfilled without a depart. Expected 0
  (a wave-4 fleer rarely kills the type solo), but the bucket
  must exist or such an instance would be `unknown`.
- **`selected-not-executed` (new sub-reason under
  `selected-blocked`):** the dawn commit was `party_launch`
  but `vbrainExecuteDepart` never ran for the holder that day
  (no depart row — the holder was not in the agency tick
  loop: away from Haven, night, or the danger gate).

Precedence (amended, first match wins): launched >
target-killed > selected-blocked > bid-not-selected >
plan-churned-before-dawn > candidate-not-bid. GO bar (1) now
reads "six buckets" with the same thresholds (≥90%
classified, 0% `unknown`). The classifier's proof fixtures
cover `target-killed` and `selected-not-executed`; the
stage-advanced fixture becomes a history case (instance stays
open across a standing transition), not a churn case.

## Correction 3 (2026-11-15, before any judged sim — control leg not yet run)

**C3 — leg anchors clarified (vetparty Stage-0 pattern).** The
prereg's "control leg on the prereg tip (this commit)" is
imprecise: the prereg commit carries no driver, so no leg can
run on it. Frozen rule: **control anchor = the instrument
commit** (driver + analyzer + proof test, seed call ABSENT);
**instrument anchor = the seed-call commit** (instrument +
the 13-line seed call). Both SHAs are recorded in the evidence
file. The judged comparison is control (recorder only) vs
instrument (recorder + seed call), identical seeds.

## Metric review (to be filled in the evidence file)

Pre-registered here: if the decomposition lands mostly in
`candidate-not-bid`, the review will name the dominant
sub-reason (gear-stage vs no-companion) with the per-dawn
counts; if it lands in `selected-blocked`, the review will
name the blocking condition per dawn; if `bid-not-selected`
is non-zero, the review will name the second selection path
that outbids a party_launch (the code says none exists). If
the instrument leg's plan-instance count is far below the
armed leg's 106 seeds (different seed band, no party/gate
lever), the review will say so with both counts — the
decomposition is judged on the instances that open, not on
matching 106. No re-scoring mid-run: the buckets above are
the judge.
