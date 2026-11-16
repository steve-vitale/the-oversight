# sim-gatelever-b — PREREG (binding)

Loop B run `fleshout-loop-b-20261116T0730Z`, axis winnability chain, arm
sim-gatelever-b — LEVER from gatereach2 §8: make the launched party
arrive as 3, the trick known before the meeting, and the plan name the
beast at the gate, so `winPlanFightGate` can SEEK. Branch
`sim-gatelever-b`, base master tip `9b04ae9b7` (coordinator evidence
commit: companionpool DIAG-GO + gatereach2 DIAG-GO, both merged locally
pending ship). Binding prereg: this file — frozen here, judged in
`evidence/2026-11-16/sim-gatelever-b.md` without alteration. The
instrument (driver, analyzer, proof test) is built AFTER this commit;
no judged numbers exist yet. The game code (seed-call base, then the
lever) is built AFTER this commit.

## The question, in plain words

Gatereach2 measured the gate seeing every launched meeting and still
never SEEKing: 46 consultations on the instrument leg, 33
`avoid:outmatched` (party 2, or unarmed/unarmored), and of the 13
nulls 9 wrong-target and 4 trick-holds. This lever removes all three
recorded causes at once — the party arrives as 3, the expedition waits
for the trick, the plan names the beast — and the pilot judges whether
SEEKs and launched-party wave-4+ kills follow.

## Prior art (read first)

- `evidence/2026-11-16/sim-gatereach2-b.md` + prereg — the DIAG this
  lever answers. Its §8 names the lever and the GO bar below; its
  §3.2 decomposes the failure (avoid:outmatched 33/46,
  null:not-target 9/13, trick-hold 4/13). Its control leg (seed call
  absent) and instrument leg (seed call on: SEEK 0, 46 consultations,
  0 kills) are the replication target for this run's control leg.
- `evidence/2026-11-15/sim-producergate-b.md` + prereg — the
  two-companion launch was already tried, alone, and NO-GO'd: 2
  size-3 launches in 8 seeds (the pool binds — 561 waits, 7
  second-companion waits), SEEK still 0, starvation 6 vs 1. This lever
  is NOT a retry of that arm: it does not wait for a second companion
  (it takes one opportunistically and launches anyway), it counts the
  plan's party in the gate, it waits for the trick instead of
  launching trick-blind, and it re-points the plan's target from the
  lived flee. Producergate §11's own suggestion — "send the pair to
  learn the trick first" — is this lever's part 2.
- `evidence/2026-11-15/sim-vetparty-a.md` + prereg — the seed call
  and the 106-seed result; the seed call re-landed here is its
  verbatim block.
- `evidence/2026-11-15/sim-dawnbid-a.md`,
  `evidence/2026-11-16/sim-companionpool-b.md` — launch
  decomposition; pool fails on profile (notRanger 41.5%), holders
  never rangers, launches form size ≤ 2.
- `evidence/2026-11-15/sim-seedattach-a.md` — 8/10 target-null plans
  are rumor-born (haven-born heard-at-fire); the seed must attach a
  target from a LIVED flee, not from rumor. This lever's part 3
  obeys that: the re-point fires only on a fought-and-fled beast,
  and the gate's lived-fought acceptance reads the holder's own
  `know.fought`, never a rumor-born plan.
- Canon: `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md`
  (wave 4 = 10 ids in `src/data/monsters.json`; the doc lists 9, the
  data rules), `docs/PARTY.md`, `docs/VILLAGER-BRAIN.md`.

## Gate code facts (read from the code, re-verified live on this tree)

- `winPlanFightGate(vid, mdef)` is `src/js/win-plan.js:482`. Party =
  self + `villagerFightAllies(vid)` (sensed only, cap 2 allies).
  OUTMATCHED for wave ≥ 4 when party < 3 or not all armed/armored.
  SEEK only when plan stage is hunt/standing, the beast is the target
  wave/species, party ≥ 3 armed+armored, AND the trick is known (else
  `trickHolds` → null, ordinary encounter proceeds, and surviving it
  teaches the trick after two observations). Single call site:
  `expeditionMonster` (`src/js/villager-agency.js:612`).
- The gate's party bar is NOT changed by this lever (still 3 for
  wave 4+). The gate's OUTMATCHED and veteran-guard branches are
  untouched. The gate's `trickHolds` branch is untouched (still
  returns null — the ordinary encounter still teaches).
- `vbrainOwnsDawn()` returns true (`src/js/villager-brain.js:634`),
  so in sims the brain owns dawn: `agencyTick` BYPASSES
  `winPlanDepart` and the real party launch lives in the brain's
  `vbrainExecuteDepart` party_launch mirror
  (`villager-brain.js:1008`), fed by `winPlanCands`
  (`villager-brain.js:189`). A lever that only changed
  `winPlanDepart.launchParty` would NEVER FIRE in sims. Parts 1–2
  are therefore built in BOTH places: `win-plan.js` (the fallback
  path, and the gate itself) and `villager-brain.js` (the live path).
- `winPlanSeedFromFight` (`win-plan.js:225`) returns its plan
  unchanged when the plan exists at hunt/standing/table stage — a
  hunt-stage holder who flees a NEW species keeps the OLD target.
  That early return is the part-3 mechanism point (see below).
- Trick learning is village-wide and needs no kill: two survived
  observations (`vFlee`/`mFlee`/`evade`) of a species set
  `villageKnowsTrick` (`src/js/game.js:36386`,
  `src/js/fieldFights.js:2747`). A holder waiting at Haven can
  therefore learn the trick from other villagers' survived
  encounters — the wait is not a deadlock, provided it is bounded
  (see part 2).
- `fieldFight` caps `allyVids` at 2 (`src/js/fieldFights.js:1230`),
  so a gate party of 3 maps exactly onto the fight's ally slots.
  `expeditionMonster` passes the sensed allies today; on a SEEK the
  lever passes the GATE's party instead (same cap, same fight
  shape — `allyFromStart` is NOT set; allies still join through the
  existing shout path, as in every expedition fight today).
- `plan.party` is read only by the win-plan/brain launch code and
  the recorders, and cleared by the gate itself on avoid
  (`plan.party = []` in both avoid branches — untouched).
- Wave-4 ids (from `src/data/monsters.json`, re-read live):
  `algorithm`, `audit`, `congregation`, `eater`, `eulogy`,
  `herald`, `influencer`, `reunion`, `strike`, `suburb` (10).
  Wave-5 ids (10): `cancellation`, `editor`, `finale`,
  `finale_crew`, `finale_opening`, `network_note`, `nielsen`,
  `rerun`, `spoiler`, `timeslot`.

## The lever — all three parts, nothing else (frozen design)

### Part 1 — the launched party arrives as 3

Two mechanisms, both inside part 1, because neither alone covers
the measured shapes:

- **(1A) Launch with two companions, opportunistically.** At launch
  time (both `winPlanDepart.launchParty` and the brain's
  `vbrainExecuteDepart` party_launch mirror), after the first
  companion is found and launched, a SECOND companion is sought with
  the SAME eligibility rule (`findCompanion`, plus an exclude for
  the first companion) and launched on the same target/duration when
  one is available. If none is available the launch proceeds with
  one companion exactly as today — NO new wait, NO hold for a second
  companion (producergate proved waiting does not create companions:
  561 waits → 2 size-3 launches). `plan.party` becomes `[c1, c2]`
  (or `[c1]` when only one launched); each launched companion's own
  plan is set to hunt with the shared target and the other two as
  its party, mirroring the existing single-companion bookkeeping.
  If the second companion's `startExpedition` fails to create an
  expedition entry, the launch proceeds with one — the holder is
  never stranded solo by a failed second launch.
- **(1B) The gate counts the plan's party.** In
  `winPlanFightGate`, after the sensed party is built, plan.party
  members are added while the party is under 3 — but only members
  with a LIVE expedition entry (`agencyState().exped[pid]` exists)
  who are alive and not already counted. Sensed members come first
  (they are physically present); plan members only fill the gap to
  3. The engine cap is preserved (party never exceeds 3:
  self + 2). The gate's party-size bar is unchanged; the gate
  judges the party that set out together, not only who shares the
  meeting tile at the roll moment.
- **SEEK fights with the gate's party.** In `expeditionMonster`,
  when the gate returns SEEK, `allyVids` is the gate's returned
  party minus the fighter (sliced to 2, the fieldFight cap),
  instead of the re-sensed allies. On non-SEEK meetings the allies
  are the sensed ones, exactly as today. `allyFromStart` is NOT
  set — no fight-engine change.

### Part 2 — the trick is known before the meeting

- **The hunt launch waits for the trick.** When a plan is at
  hunt/standing stage, names a wave-4+ target species
  (`plan.target` resolves to a wave ≥ 4 monster in the data), and
  the village does not yet know that species' trick, the departure
  HOLDS instead of launching — in `winPlanDepart` (return `'hold'`)
  and in the brain (a `trick_wait` candidate in `winPlanCands`
  with weight 6.0, above the 5.0 party_launch bid, and
  `vbrainExecuteDepart` returns `'hold'` for it, alongside the
  existing `gear_hold` / `veteran_guard` / `party_wait` holds).
- **Bounded, once per target.** The wait uses two new plan fields,
  `plan.trickWaitSinceDay` (first wait day, -1 when unset) and
  `plan.trickWaitedFor` (target id the wait already expired for).
  After 7 days (`TRICK_WAIT_DAYS = 7`, the veteran-guard bound)
  the wait expires: `trickWaitedFor` is set to the target, the
  clock resets, and the hunt launches — trick-blind if the trick
  is still unknown, exactly as today, so the gate's trickHolds
  branch and ordinary encounters can teach it. A later re-point
  to a NEW target (part 3) starts a fresh wait for that target;
  a rumor-born target-null plan never waits (there is no species
  to wait for). The wait is a departure hold only: the holder stays
  at Haven that day, other villagers still range and can observe,
  and the village-wide trick counter is what releases the wait.
- The brain feeder writes ONLY this wait clock on an existing plan
  (never seeds a plan — the feeder's read-only rule is otherwise
  kept: no `winPlanOf` call, no new plan creation). This minimal
  exception is recorded here so it is a decision, not drift.

### Part 3 — the plan names the beast at the gate

- **(3A) The seed re-points the target on a lived flee.**
  `winPlanSeedFromFight` with outcome `'fled'`, when the plan
  exists at hunt/standing stage, now sets `plan.target` to the
  fled species, `plan.needWave` to its wave, and `plan.node` to
  the fighter's current node — the hunt re-points at the beast
  actually faced. Gear/party-stage behavior is unchanged (the
  seed already sets the target there); table-stage plans are NOT
  re-pointed (they do not SEEK); `'evaded'` and `'avoided'`
  outcomes do NOT re-point (a sighting or an avoided meeting is
  not the fought beast — the re-point fires only on `'fled'`).
- **(3B) The gate accepts lived-fought knowledge.** In
  `winPlanFightGate`, `isTarget` gains one more disjunct: the
  plan is at hunt stage AND the holder has personally fought this
  species (their agency `know.fought` list contains `mdef.id`).
  A rumor-born plan holder has fought nothing, so their
  `know.fought` is empty for the beast in front of them and the
  gate does NOT accept them — rumor-born plans are never converted
  into named hunts. Only a lived fight earns the acceptance, read
  live from agency knowledge, never from a roster.

Nothing else changes: no gate bar, no standing/readiness number, no
win price, no deed gate, no table rule, no companion-pool rule (the
profile gate stays — see Loop A note below), no food rule.

## Substrate + control design (frozen, justified here)

The lever only exists on seeded plans, so the vetparty seed call (the
13-line block removed by `7ba893b4b` in
`resolveWildMonsterEncounter`, `src/js/game.js`, beside the existing
return-to-fight sighting block; blob `a66d45a5e` — verbatim text in
the gatereach2 prereg) is re-landed as the lever's BASE.

- **Control leg = seed-call-only.** This replicates the gatereach2
  instrument leg on identical seeds (expected: SEEK 0, ~46
  consultations, 0 kills) — a replication check, reported in the
  evidence. The alternative design (control = pure master) was
  rejected: on pure master the subject barely exists (~10
  consultations per 8-seed leg, ~0 launched arrivals), so a
  pure-master control would compare a lever acting on plans
  against a control with almost no plans — a vacuous baseline
  that cannot show whether the GATE changes did anything. The
  seed-call-only control isolates the gate lever from the seed
  call: both legs have the same plans and launches; only the gate
  changes differ. If the replication check fails materially (SEEKs
  in control, or consultation counts far from 46), the evidence
  says so and the verdict is re-examined, not re-scored.
- **Lever leg = seed call + the three gate changes.**
- Anchors: control anchor = the seed-call commit (game.js only);
  lever anchor = the lever commit (win-plan.js, villager-brain.js,
  villager-agency.js on top of the seed call). If the pilot NO-GOs,
  ALL game code is reverted on the branch (lever + seed call) and
  the arm lands evidence-only, per the run brief.

## Mechanism expectation (from the gatereach2 band — NOT judged)

Re-analysis of the gatereach2 instrument corpora
(`evidence/2026-11-16/perseed-gatereach2-b-on/`, 46 wave-4+ gate
rows) before freezing, to say honestly where SEEKs are expected
to come from:

- All 13 null rows are ALREADY party-size 3, allArmed and
  allArmored. The party is not what blocks the nulls — the target
  (9) and the trick (4) are.
- Mechanism (1B) converts ~0 rows on that band: in all 30
  party-size-2 rows the plan companion is already inside the
  sensed party (the companion is co-located/crew when present);
  where the plan companion is absent from the party (e.g. seed
  102001 d41), the sensed party is already 3 with strangers, so
  the cap leaves no room to add them. (1B) is kept as robustness
  for the lever leg's changed trajectories, not as the expected
  SEEK source — the pilot measures how often it fires
  (`partyFromPlan` on gate rows).
- Mechanism (1A) is pool-bound: producergate's waiting design
  produced 2 size-3 launches in 8 seeds. This design does not
  wait, so it should do at least as well on launch count, but the
  second companion is still only there when one is free at Haven.
  The pilot measures second-companion launches directly.
- The expected SEEKs, if any, come from parts 2+3 acting on the
  already-3 party rows: a trick-wait that releases once the trick
  is learned, and a re-pointed/lived-fought target that makes the
  next meeting `isTarget`. The driver records each mechanism's
  firings (second-companion launches, trick_wait holds, re-point
  rows, gate rows by `partyFromPlan` / lived-fought acceptance),
  so the evidence decomposes any SEEK by mechanism — and if the
  pilot NO-GOs, the decomposition says which part failed instead
  of blaming "the lever".

## GO bar (gatereach2 §8, binding) — GO iff ALL hold

Frozen definitions (pinned here because §8 leaves the kill scope
open — these are the run's own definitions, made BEFORE any judged
sim):

1. **Gate SEEKs ≥ 1 per 8-seed leg** (lever leg): count of wave-4+
   gate rows with result `seek` (rows; distinct meetings
   seed+vid+day+mid reported alongside).
2. **Launched-party wave-4+ field kills ≥ 1 per 8-seed leg**
   (lever leg): distinct meetings (seed+vid+day+mid) among
   wave-4+ encounter rows with outcome `vKill`, origin
   `expedition`, and a covering win-plan launch for the fighter
   (holder, launched=true, day in [launch day, launch day +
   duration]).
3. **Kill:death ≥ 0.92** (lever leg): numerator = the bar-2 kills
   (distinct launched-party wave-4+ field kills); denominator =
   encounter-row `vDie` on launched-party wave-4+ meetings
   (same distinct-meeting definition, outcome `vDie`) PLUS
   same-day/same-beast 'villager combat' deaths (death-log rows
   with kind `monster`, cause `villager combat`, naming the killed
   beast, on the same day as one of the bar-2 kills — the
   analyzer's existing `vcDeaths` shape, extended to wave 4+).
   CLARIFIED by Correction C1 below: those rows are the killed
   beasts' own death records, not villager deaths, so the term
   contributes 0 and the denominator is the `vDie` count alone.
   If the denominator is 0 and the numerator is ≥ 1, bar 3
   PASSES (no deaths to count against; the bar guards against
   death-heavy kills — the producergate precedent, §9.1, where
   "kills with zero deaths pass"). If the numerator is 0, bar 2
   already fails. The producergate-style wave-5-only kill:death
   is reported as a secondary for comparability, not judged.
4. **FACED-NOT-KILLED share among unlocked ≤ 0.20** (lever leg):
   the analyzer's existing share (classes `FACED-NOT-KILLED` /
   unlocked, where unlocked = wave-5 unlocked seeds).
5. **Starvation ≤ control + 2 AND median survival ≥ 0.8×
   control** (lever leg vs control leg): starvation = death-log
   starvation/hunger deaths; median survival = median `days`
   across all 8 seeds per leg (analyzer pooled
   `medianSurvivalAll`).

- Seeds: **102101–102108** (8 seeds). Freshness (this arm, before
  this commit, per the seed-band-freshness skill): ZERO hits for
  102101–102108 in (a) all `evidence/*/sim-*-prereg.md`, (b) all
  `evidence/**/*.md` (sim-*.md), (c) `scripts/*.js`, (d) the goal
  `hidden_files/convergence-tracker.md` and `sim-findings.md`,
  (e) `~/memory/2026-11-*.md`, (f) per-seed directory/filenames
  under `evidence/` (no `perseed-*10210*`, no `*10210*`
  filenames), (g) the goal `hidden_files/lever-claims/` claim
  files. Neighbouring used bands avoided: 102001–102008
  (gatereach2, 0530Z), 10211–10218 (sicktele). NEVER use:
  100621–100636, 100861–100868, 100821–100828, 100721–100728,
  100761–100768, 10100–10139, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568.
- Horizon 150 days, death-aware. Policy competent verbatim
  (`scripts/policies/competent.js`, sha256
  `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`
  — verified by this arm with sha256sum before this commit; the
  same sha dawnbid/gatereach2 recorded, `74a890f0844e` prefix).
  The driver's own-policy record carries the sha it ran under.
- Pilot 8 seeds before any confirm spend. If the pilot NO-GOs,
  the lever is KILLED (revert game code on the branch, land
  evidence-only) — no 12–16 seed confirm on an invisible effect.

## Correction (2026-11-16, BEFORE any judged sim — no corpus exists yet)

**C1 — bar 3's second denominator term is the killed beasts' own
death records, not villager deaths, so it contributes 0.** Bar 3 as
frozen says deaths count "encounter-row `vDie` PLUS same-day/
same-beast 'villager combat' deaths". Verified on the gatereach2
corpora (both legs, 16 files): the death log carries NO villager
death row with cause `'villager combat'` (0 of 219 villager-kind
rows; villager deaths carry kind `'villager'` with cause = the
monster's name). All 537 `'villager combat'` rows are kind
`'monster'` — the KILLED BEASTS' own death records, one per kill.
Counting those as "deaths" would put one row per kill in the
denominator (the producergate 5-kills/5-counted-deaths 1.00 was
that artifact: its one wave-5 field vDie never entered the count).
So the bar-3 denominator is the encounter-row `vDie` on
launched-party wave-4+ meetings ONLY (distinct meetings); the
`'villager combat'` term contributes 0 by construction. The
zero-denominator pass rule stands (denominator 0 with numerator
≥ 1 passes). The analyzer reports the monster-record
`vcDeaths` count as a secondary for comparability with the
inherited `judgeAidgate`, never in the bar. The bars are
unchanged; only the denominator's second term is clarified to
what the death log actually contains.

## Instrument (frozen)

- Driver: `scripts/gatelever-driver-20261116.js` (new — copy of
  `scripts/gatereach2-driver-20261116.js`, EXTENDED, not rebuilt:
  same harness, snapshot, cascade, w5 recorder, gate rows,
  launches — unchanged — plus the gatelever additions below).
  RUN/OUTDIR defaults renamed (`gatelever-b`,
  `perseed-gatelever-b-control` / `-lever`); per-seed filename
  prefix `gatelever-b-s`. Recorder wraps are pure reads plus
  writes to driver-local arrays — no game-state writes, no RNG.
  The driver refuses to overwrite an existing per-seed file.
  `GATELEVER_RECORDER=off` skips the recorder wraps (D2).
- Gatelever additions to the recorded rows (all additive; existing
  fields keep their gatereach2 meanings):
  - Gate rows: `partyFromPlan` (plan.party members the gate added
    beyond the sensed party — 0 when mechanism (1B) did not fire),
    `livedFought` (holder's `know.fought` contains the beast id),
    `trickWaitedFor` (plan.trickWaitedFor at consultation time).
  - Seed rows: `repointed` (true when the seed changed the target
    of an existing hunt/standing plan — mechanism (3A)).
  - Depart rows (both wraps): `trickWaitSinceDay`,
    `trickWaitedFor`, and `secondCompanion` (the second companion
    id on a launch, or null) — so trick_wait episodes and
    second-companion launches are countable from the corpora.
  - The `winPlanFightGate` wrap records the gate's RETURNED party
    (which now includes plan-counted members) exactly as
    gatereach2 did — no change needed beyond the new fields.
- Analyzer: `scripts/analyze-gatelever-b.js` (new — requires
  `scripts/analyze-gatereach2-b.js` and adds the gatelever
  judgment on top of its `analyzeFiles` output; the gatereach2
  analyzer itself is NOT modified). It reports, per leg: SEEKs
  (rows + distinct), launched-party wave-4+ field kills
  (distinct meetings), kill:death as defined in bar 3 (plus the
  wave-5-only secondary), FACED-NOT-KILLED share, starvation +
  median survival, the mechanism decomposition (second-companion
  launches, trick_wait holds/episodes, re-point rows, gate rows
  with `partyFromPlan > 0`, SEEKs by mechanism), the wall numbers,
  and the five-bar judgment. It exits non-zero on any `unknown`
  consultation path or arrival, as gatereach2 did.
- Drift check: `scripts/gatelever-drift-check.js` (new — copy of
  `scripts/gatereach2-drift-check.js`, same verdict logic over the
  series fingerprint, but first-lever-day = the earliest LEVER
  action in the lever leg: the first trick_wait depart row, the
  first second-companion launch, the first re-point seed row, or
  the first gate row with `partyFromPlan > 0` or a lived-fought
  acceptance — whichever is earliest. The seed call is present in
  BOTH legs, so the first `w5seeds` day is NOT a lever-action day
  here; using it would misread the smoke. If no lever-action row
  exists in the lever leg, first-lever-day is null and any
  divergence is DRIFT.
- Proof test `scripts/test-gatelever-b.js` (new; see below). GREEN
  on the lever tip before the lever leg runs; GREEN again
  post-revert.
- Balanced panel (MEASUREMENT.md §15): this IS a before/after
  lever comparison — run `scripts/balance-panel.js`, attach the
  compare .md to the evidence file. The panel is the instrument,
  the prereg bar is the judge.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** lever tip, seed 102101, **150d**,
  recorder ON, run twice → identical per-seed JSON (deaths/days/
  endReason/vet5 + all gate rows identical). 150d, not 60d:
  gatereach2's metric review (§9.1) notes its 60d D1/D2 ran over
  zero gate rows, so the live gate-wrap proof rested on the
  corpora; this run proves the wrap in the proof test itself.
- **D2 (wrap neutrality):** lever tip, seed 102101, 150d, recorder
  ON vs recorder OFF (`GATELEVER_RECORDER=off`) → identical
  trajectories (deaths/days/endReason/standing/vet5 + daily
  fingerprints). The seed call and the lever are game code, present
  in both legs — D2 isolates the wraps only.
- **D3 (drift smoke):** `scripts/gatelever-drift-check.js` over the
  two corpora (control vs lever) — first divergence on/after the
  first lever-action day per seed; NO PRE-LEVER DRIFT.

## Proof test

`scripts/test-gatelever-b.js` proves, on synthetic fixtures and
live in-memory runs (no corpus numbers):

- Static: the seed call is present in `src/js/game.js` (verbatim
  VETPARTY block) on the lever tip; the lever is present
  (second-companion launch in both `win-plan.js` and
  `villager-brain.js`, gate plan-counting, trick-wait in both
  paths, seed re-point, lived-fought acceptance, SEEK ally
  wiring in `expeditionMonster`); the game-code diff vs the
  pre-seed base touches exactly `src/js/game.js` (seed call),
  `src/js/win-plan.js`, `src/js/villager-brain.js`,
  `src/js/villager-agency.js` (the lever files); no standing /
  readiness / win-price / deed-gate / table text in the diff; the
  wave-4 id set matches `src/data/monsters.json` wave 4 exactly
  (10 ids). Post-revert the same static suite passes in the
  off-shape (seed call absent, lever absent, src diff 0 lines).
- Unit (gate classifier fixtures incl. the three lever parts):
  plan-counted party reaches 3 (sensed 2 + plan member on
  expedition); plan member without an expedition entry is NOT
  counted; plan member already sensed is not double-counted;
  party never exceeds 3; trick-wait hold fires only for a named
  wave-4+ target with unknown trick at hunt/standing (not for a
  target-null plan, not for a wave-3 target, not once waited for
  that target, releases after 7 days); seed re-points the target
  on `'fled'` at hunt/standing (not on `'evaded'`/`'avoided'`,
  not at table stage, not when no plan exists); gate accepts a
  hunt-stage plan when `know.fought` contains the beast (not when
  it does not, not for a rumor-born plan with empty fought).
- Recorder: synthetic fixtures for the gate-row new fields
  (`partyFromPlan`, `livedFought`), the seed-row `repointed`
  flag, and a depart-row trick_wait shape; a live in-memory run
  proves the `winPlanFightGate` wrap records a consultation
  without changing the gate's return value.
- Determinism: D1 + D2 as frozen above (seed 102101, 150d).
- GREEN on the lever tip before the lever leg runs; GREEN again
  post-revert.

## Sense-testing

Quote the gate/fight lines the recorder captures
(`w5encounters[].log[]`) for 2–3 gate consultations / fights in
the lever leg and judge whether the meetings read like meetings —
and whether the PARTY reads like a party. Name the lines' source
(seed, day, fighter, monster) and the counts searched. Do not
invent fight narrative from kill counts.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 4 "The Mirror Draft"
  (standing ≥ 100; readiness wave 4: 3 armored P≥10, 5 armed, 3
  tricks, 1 wave-3+ killer — the bar this chain feeds, not
  changes). Wave 5 "The Producers" (standing ≥ 200 AND wave-4
  faced). Doc drift noted: the doc lists 9 wave-4 monsters; the
  data has 10 (herald).
- `docs/PARTY.md` — the party concept this chain test-cases
  (party cap 3 — the scholar's party; the villager party of 3
  here is fighter + 2 sensed allies through
  `villagerFightAllies`, now plus the plan's launched party).
- `docs/VILLAGER-BRAIN.md` — the one-brain contract: Phase 1
  (dawn scorer; drive candidates as scorer candidates), §9 (win
  prices / deed gates / readiness bars untouched; perception law).
  The trick-wait is a dawn candidate with a hold action, inside
  that contract; the gate-counting reads only the plan's launched
  party (people who set out together, on expedition now), never
  a roster scan.
- Prior evidence: `evidence/2026-11-16/sim-gatereach2-b.md`
  (§3.2, §8), `evidence/2026-11-15/sim-producergate-b.md`
  (§4, §9, §11), `evidence/2026-11-15/sim-vetparty-a.md`,
  `evidence/2026-11-15/sim-dawnbid-a.md`,
  `evidence/2026-11-16/sim-companionpool-b.md`,
  `evidence/2026-11-15/sim-seedattach-a.md`.

## Loop A interaction (coordinator note, recorded here)

Loop A is LIVE on scale-onramp this run
(`fleshout-20261116T0645Z`). Its sim-launchdef-a worker reports
PILOT GO — the profile-gate bypass lands as game code via Loop
A's coordinator (launches can then take non-ranger companions).
That bypass has NOT landed in this worktree's base: `findCompanion`
in both `win-plan.js` and `villager-brain.js` still requires
profile wanderer/explorer on this tree. This lever is therefore
measured on the PROFILE-GATED pool, and its part-1 yield must be
read that way. If the bypass lands in master mid-run, the
coordinator handles the rebase and this arm re-runs the affected
legs; the interaction is noted in the evidence. This arm touches
no Loop A file except `win-plan.js` / `villager-brain.js`, which
Loop A's bypass also touches — the coordinator rebases at landing.

## Metric review (to be filled in the evidence file)

Pre-registered here: the bar-3 kill:death definition pins the
kill scope to the lever's own kills (launched-party wave-4+
field kills) rather than the producergate wave-5 scope — if the
lever leg produces wave-4 kills but zero wave-5 kills, bar 3
still judges the kills the lever actually made, and the wave-5
secondary is reported alongside for comparability. The bar-2
distinct-meeting count (not rows) prevents one meeting counted
under two launches from inflating the kill bar — the arrival
double-count gatereach2 §9.2 named. The control leg's expected
SEEK 0 / 0 kills is a replication check, not a bar: if control
SEEKs, the evidence names it and the verdict is re-examined.
The trick-wait's 7-day bound is a design guess, not a measured
optimum: if waits expire unlearned on most targets, the review
will say the bound (not the wait) needs sizing. The D3
first-lever-day definition is new (four lever-action row kinds)
— if no lever-action row exists on some seed, that seed's smoke
reads DRIFT on any divergence, and the review will say the
lever never acted there rather than claiming substrate drift.
