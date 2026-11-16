# sim-rumorplan-a — PREREG (binding)

Run: fleshout-20261116T0645Z (Loop A), axis scale-onramp, arm
sim-rumorplan-a — DIAG: the lifecycle of rumor-born hunt-stage
plans. Do rumor-born plans EVER convert to a named-beast wave-4+
launch, and what share of wave-4+ launches are rumor-born?
Branch `sim-rumorplan-a` (worktree
`~/workspace/worktrees/sim-rumorplan-a`). Base: master at arm start,
branch tip `a3462c4f2` (coordinator evidence commit for round 0446).
Binding prereg: THIS file — frozen before any judged sim. The
instrument (driver, analyzer, proof test) is built AFTER this
commit; no judged numbers exist yet. DIAG, instrument-only:
NO src/js change in this arm. Claims tracker blank 3 follow-on /
`sim-findings.md` item "RUMOR-BORN PLANS REACH HUNT WITH NO BEAST
NAMED" (2026-11-16, marked [claimed] by this arm at start).

## The question, in plain words

Seedattach (DIAG-GO, `evidence/2026-11-15/sim-seedattach-a.md`)
proved 8 of 10 target-null hunt-stage plan instances were born
from fire talk — the holder fought nothing, the village had slain
beasts, the plan named none — and still launched and hunted:
Carlos Diaz went out 17 times with a plan that named nothing.
The seed works at party stage and is inert at hunt stage (the
Carlos natural experiment), so seed-attach cannot help the
dominant shape. What seedattach did NOT answer: does a rumor-born
plan EVER acquire a real target before it launches — i.e. is
there a conversion path at all — and, across all wave-4+ launches,
how much of the launching is rumor-born vs fought-personally vs
companion-inherited? This DIAG traces every hunt-stage plan
instance on the band from birth to launch-or-death and classifies
every wave-4+ launch by the launched plan's origin.

## Prior art (read first)

- `evidence/2026-11-15/sim-seedattach-a.md` + prereg — the
  10-instance decomposition, the origin buckets, the creation /
  launch / bounce / census recorder, the Carlos natural
  experiment, the 82% world-tick seed-coverage gap.
- `evidence/2026-11-15/sim-scale-onramp-round-0446.md` —
  coordinator evidence: the cross-arm policy lesson (a real
  tableseat-nowait baseline needs `TABLESEATNOWAIT=1
  LEANLINKRESCUE=1`; default env collapses to competent) and
  the any-commit launch lesson (the two real wave-4 launches
  came through mid-day refresh commits; the next prereg must
  count launches on any commit, dawn or mid-day).
- `evidence/2026-11-15/sim-dawnbid-a.md` and
  `sim-profilegate-a.md` — dawn-bid / launch context.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md`
  (wave 4 "The Mirror Draft", wave 5 "The Producers").

## Code facts the taxonomy is built on (read from src, frozen)

Verified on this tree before this prereg (`src/js/win-plan.js`,
`src/js/villager-brain.js`, `src/js/villager-agency.js`):

1. `plan.target` is written in EXACTLY TWO places (as seedattach
   found): `winPlanSeedFromFight` (`win-plan.js:239`,
   `plan.target = mdef.id`), ONLY when the plan stage is `gear`
   or `party` — for `hunt` / `standing` / `table` it returns the
   plan unchanged (line 231) — and `winPlanDepart.launchParty`
   (`win-plan.js:439`): the companion's plan copies the
   inviter's target (`cplan.target = plan.target`) — a null
   target copies as null.
2. The seed is wave-gated (`win-plan.js:226`): `(mdef.wave||1)
   < 3` returns null — a seed can only ever set a wave-3+
   target. The seedattach bounce capture (wave >= 3) therefore
   covers EVERY seed-set event.
3. NOTHING ever writes `target` back to null. There is no
   clearing write in the code. A plan that once had a target
   cannot lose it except by plan deletion.
4. Plan deletion happens in EXACTLY ONE place:
   `winPlanHavenTick` (`win-plan.js:321`, `delete
   v.winPlan[vid]`) when the table is active. Villager death
   leaves the entry in place (holder dead, plan present).
5. Plans are created target-null in three places: `winPlanOf`
   (`win-plan.js:218`, lazy create — also called as a read by
   the brain, which creates as a side effect; `sinceDay: 0`
   default); `winPlanHavenTick` (`win-plan.js:314`,
   engagement creation); `winPlanSeedFromFight`
   (`win-plan.js:235`, creates then IMMEDIATELY sets the
   target — never null after). HavenTick creation is
   RANGER-GATED (`win-plan.js:307`: profile must be
   `wanderer` or `explorer`) and engagement-gated (the
   villager personally fought a beast — `know.fought`
   non-empty — OR the village has slain one, the fire-talk
   channel `villageSlain`). (The ranger gate is new to this
   prereg; seedattach did not name it.)
6. Stage `hunt` is set in EXACTLY FOUR places:
   `win-plan.js:435` (launchParty inviter) and `:439`
   (companion copy, target included);
   `villager-brain.js:1047` (brain-mirror inviter) and `:1049`
   (brain-mirror companion — sets stage + party ONLY, does
   NOT copy the target: a fresh companion plan keeps its null
   target).
7. Stage LEAVES `hunt` in exactly three ways (the lifecycle
   transitions this DIAG traces): the fight gate
   `winPlanFightGate` OUTMATCHED branch (`win-plan.js:503`:
   stage back to `party`/`gear`, party cleared — a hunt plan
   that meets a wave-4 beast without a full geared party is
   demoted); `winPlanNoteKill` (`win-plan.js:269`: a wave-3+
   kill while at `hunt`/`party` advances the plan to
   `standing`); `winPlanHavenTick` (`win-plan.js:341`: a
   `hunt`/`standing` plan advances to `table` when the
   fifth-draft beat has fired and the holder has a wave-4+
   kill). (The veteran-guard demotion at `:503` is the same
   line as the outmatched demotion.)
8. `winPlanDepart` attempts a launch for stage `party`,
   `hunt`, `standing`, AND `table` alike (`win-plan.js:468`):
   launches are NOT hunt-only. A party-stage launch with a
   wave-4+ target is a wave-4+ launch by content, even though
   the plan has not reached hunt. Stage at launch is recorded
   on every launch row so the hunt/party split is reported,
   not assumed.
9. Live seed call sites on current master (this arm re-lands
   NOTHING): `villager-agency.js:643` (`'evaded'`), `:726`
   (`'fled'`), `win-plan.js:512` (`'avoided'`, via the fight
   gate). `src/js/game.js` has NO seed call — the world-tick
   call is gone (dawnbid revert, kept reverted; the
   world-tick seeding design call is NOT this arm's).

## Frozen definitions

- **Wave-4 monster ids** (from `src/data/monsters.json`, wave 4;
  10, re-read live by the driver): `algorithm`, `audit`,
  `congregation`, `eater`, `eulogy`, `herald`, `influencer`,
  `reunion`, `strike`, `suburb`.
- **Wave-5 monster ids** (from `src/data/monsters.json`, wave 5;
  10, re-read live by the driver): `cancellation`, `editor`,
  `finale`, `finale_crew`, `finale_opening`, `network_note`,
  `nielsen`, `rerun`, `spoiler`, `timeslot`. (The doc lists 8
  Producers; the data has 10 — `finale_crew` /
  `finale_opening` — the data rules, same as the wave-4
  `herald` drift seedattach noted.)
- **A plan instance** starts at ONE creation event (a
  `seedattachCreations` row: before-null → after-exists for
  that vid) and ends at the next creation for the same vid
  (superseded), at plan deletion, at holder death, or at run
  end. Epoch key: (vid, creation day).
- **A hunt-stage plan instance** (the population) is a plan
  instance whose stage is `hunt` on at least one census day
  OR which launches with stage `hunt` (either is enough; the
  census is daily, a launch can happen between censuses).
  Hunt entry day = the earliest of (first census day at stage
  hunt, first launch day with stage hunt).
- **Origin buckets** — exactly one per hunt-stage instance,
  precedence in this order (first match wins), reusing the
  seedattach rules with hunt-entry day in place of the
  first-bounce day as the evidence-scoping day:
  1. `companion-inherited` — the plan entered `hunt` as a
     launch companion copy with the inviter's target null.
     Evidence: a launch event with vid as companion and
     inviter target null on/before hunt entry, OR first
     census sighting at stage `hunt` with party `[inviter]`
     and the inviter's plan target null that day. Covers
     BOTH launch paths (win-plan copies the null target;
     the brain mirror leaves the fresh companion plan null).
     Path is recorded as a sub-field (`winplan` vs `brain`
     vs `census-only`). A companion rumorplan row at hunt
     stage counts as launch evidence even when the plan left
     hunt before the next census (Correction 2 note: the
     launch event itself is the entry proof).
  2. `seed-created` — the plan was created BY the seed
     (`winPlanSeedFromFight` creating then immediately
     setting the target): born targeted from a beast the
     holder fought. Evidence: a seed-create bounce
     (stageBefore null, targetAfter non-null) with no
     earlier creation row for the vid.
  3. `haven-born` — the plan was created target-null at Haven.
     Sub-reason from the engagement reads at creation (most
     informative first): `fought-personally` (`know.fought`
     non-empty — the villager DID fight a beast, but the plan
     never named it); `heard-at-fire` (`villageSlain` only —
     rumor-only, no beast the villager met); `created-by-read`
     (neither engaged at creation — a lazy `winPlanOf` read
     created the plan, engagement came later). A
     `seededBeforeHunt` flag records whether a seed-set event
     happened before hunt entry (the conversion shape); the
     seedattach comparison shape is `heard-at-fire` AND NOT
     `seededBeforeHunt`.
  4. `seeded-then-lost` — a non-null target was observed for
     the plan in an earlier census or seed event, and a null
     target later. The code says no clearing write exists;
     EXPECTED 0. Any instance here must name the transition
     days in the evidence.
  5. `unknown` — fits none of the above (analyzer bug). The
     bar allows ≤10% unknown, but 0 is expected; any
     instance here is named individually in the evidence.
- **Rumor-born** = `haven-born` with sub-reason
  `heard-at-fire` (fought `[]`, `villageSlainTotal` > 0 at
  creation) — the 8/10 shape from seedattach.
- **Conversion (Q1)**: a rumor-born instance has a hunt-stage
  launch whose target at launch is a wave-4+ monster (a
  named beast). Counted per instance (converted or not) and
  per launch. Also counted: rumor-born instances that ACQUIRE
  a wave-4+ target before their first hunt launch but never
  launch with it (acquired-but-unlaunched), with the
  acquisition mechanism named from the census-diff /
  bounce / launch evidence (seed at party stage, companion
  copy from a targeted inviter, other).
- **A launch event** = one `rumorplanLaunches` row with
  result `launch` — one per participant per depart call
  (inviter + each companion), on EITHER path
  (`winPlanDepart` or `vbrainExecuteDepart`), on ANY commit
  (dawn or mid-day refresh — the profilegate any-commit
  lesson). The launch row records the participant's plan
  stage / target / needWave / node / party BEFORE and AFTER
  the call.
- **A wave-4+ launch** = a launch event whose launched plan
  satisfies ANY of: `needWave` ≥ 4 at launch; target is a
  wave-4 or wave-5 monster at launch; the plan instance has
  ≥1 wave-4 seed bounce in its recorded history
  (target-null hunt plans that have been in wave-4 seed
  contexts). The STRICT subset (first two conditions only)
  is reported alongside, so the headline share can be read
  under either definition.
- **Lifecycle terminal state** (per hunt-stage instance,
  orthogonal to launch status): `holder-died` (census shows
  holder dead, or a death row names the vid, while the
  instance is active); `superseded` (plan gone from census
  and a new creation for the same vid follows);
  `deleted` (plan gone, holder alive, no successor creation);
  `churned` (stage left `hunt` without a launch — hunt→party
  via the fight-gate demotion, hunt→standing via a kill,
  hunt→table via HavenTick; the destination stage is named);
  `alive-at-end` (still `hunt` at run end — censored).
  Launch status is recorded separately per instance:
  `launched-targeted` (≥1 hunt launch with a wave-4+
  target), `launched-target-null` (≥1 hunt launch, all
  target-null), `launched-party-stage-only` (launches only
  at party stage), `never-launched`.
- **Trip window (Q3)**: for a target-null hunt launch, the
  days [launch day, first census day after launch on which
  the holder is no longer on expedition, capped at +14d].
  Wave-4 encounters (`v4encounters`) and wave-4 seed calls
  (`v4seeds`) joined on (vid in the launch party, day in
  window) count what the trip did. A sample of up to 3
  launched target-null trips WITH encounters is read
  line-by-line from `v4encounters[].log[]` and judged for
  sense (SENSE-TESTING LAW).
- **Instrument error:** any non-empty `instrumentErrors`, any
  per-seed file failing to parse, any seed whose unlock/kill
  fields disagree (same rule as the seedattach prereg).

## Primary metric + GO bar (frozen)

GO (DIAG-GO: instrument valid, lifecycle measured) iff ALL hold:

1. **≥90% of hunt-stage plan instances classified,
   unknown ≤10%.** (Three substantive buckets cover every
   code path, so ~100% is expected; the bar allows analyzer
   -edge misses, but `unknown` must be ≤10% of instances.)
2. **Corpus 8/8 files parse** (main leg) **+ 8/8** (replication
   leg), identical seeds.
3. **Neutrality proven:** drift smoke clean (no pre-seed
   divergence on any seed) AND determinism legs green (D1 +
   D2 below) AND the §15 panel compare main→replication
   shows no material signal (the two legs are the same
   policy on identical seeds — the panel is a replication
   check, not a lever contrast).
4. **Proof test `scripts/test-rumorplan-a.js` green.**

This is a DIAG: GO means the instrument is valid and the
lifecycle is measured. It is NOT a lever GO — no game change
is judged, and nothing ships from this arm except the
instrument + evidence. A GO with 0 conversions still answers
Q1 ("never") — that IS the answer, not a failed run.

## Secondary (reported, not judged)

- Q2 share table: wave-4+ launches by origin
  (heard-at-fire / fought-personally / created-by-read /
  companion-inherited by path / seeded-then-lost / unknown),
  with the strict-subset count alongside; plus the same table
  for ALL hunt-stage launches (not just wave-4+).
- Q1 conversion table: rumor-born instances → converted /
  acquired-but-unlaunched (mechanism named) / never acquired
  / launched target-null (count of launches) — with the
  Carlos-style natural-experiment case named if one occurs.
- Lifecycle table: hunt-stage instances by (origin × launch
  status × terminal state).
- Q3 trip table: target-null hunt launches → trips with ≥1
  wave-4 encounter, outcomes of those encounters
  (flee/evade/fight/kill), seed calls in window; plus the
  sense-read sample.
- Per-seed table: hunt-stage instances opened, wave-4+
  launches, conversions, seed calls (wave ≥ 4 and wave 3),
  repeat bounces.
- Wall numbers (BOTH legs): national / table / wins, wave-4/5
  unlocks, median survival.
- Sense check: quote ONE concrete rumor-born case end to end
  (what the villager planned, what the target was, what
  happened at dawn and on the trip) from the main leg's
  `v4encounters[].log[]` and the rumorplan rows — name seed,
  day, villager, monster.

## Seed band (verified fresh per the seed-band-freshness skill)

- **102011–102018** (8 seeds), 150d death-aware.
- Leg 1 (judged): **tableseat-nowait**
  (`scripts/policies/tableseat-nowait.js`, sha
  `a11a1abc672e` — verified by this arm with sha256sum before
  this commit) with **`TABLESEATNOWAIT=1 LEANLINKRESCUE=1`
  on BOTH legs** — a REAL tableseat-nowait baseline (the
  0446Z cross-arm lesson: default env collapses to
  competent). Wall comparability with the sibling arm
  (profilegate, same policy + flags on band 100871–100878).
- Leg 2 (replication): identical policy / env / seeds — a
  full-corpus determinism replication. The JUDGED
  classification is leg 1 only; leg 2 is classified as a
  cross-check and must match leg 1's trajectories.
- Freshness check (this arm, before this commit — scope and
  result): zero whole-token hits for `102011`–`102018` in
  (a) all `*.md` under `evidence/` (grep rc=1, including all
  dated preregs `evidence/*/sim-*-prereg.md` and today's
  `evidence/2026-11-16/*.md`), (b) `scripts/*.js` driver band
  literals (rc=1), (c) per-seed filenames under `evidence/`
  (no `10201[1-8]` file), (d) the goal `hidden_files/`
  tracker, lever-claims, and findings `.md` — the ONLY hit
  anywhere is the tracker line naming the sicktele pilot band
  `10201–10208` (5-digit seeds 10201–10208, a DIFFERENT band;
  see `evidence/2026-10-30/sim-sicktele-b-prereg.md:135`).
  The `.json` hits for the substring `10201` are kcal values
  (e.g. `"pantryFreshAfter": 102013`), not seed-band usage —
  same class as the coordinator's 0446Z note. Neighbouring
  used bands: 100871–100878 (round 0446), 100861–100868
  (dawnbid/ammocensus). Loop B uses DIFFERENT band
  102001–102008 — do not use it.
- NEVER 100521–100536, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568
  (task-forbidden bands).

## Horizon, policy, legs, panel applicability

- Horizon 150 days, death-aware (dead villages stop
  simulating).
- Leg 1 (judged): tableseat-nowait + recorder, flags on,
  seeds 102011–102018.
- Leg 2 (replication): tableseat-nowait + recorder, flags on,
  IDENTICAL seeds. The recorder is neutral (proven by D1/D2),
  so leg 2 also yields classification instances as a
  cross-check; the JUDGED classification is leg 1 only.
- **§15 balanced panel:** `scripts/build-rumorplan-panels-20261116.js`
  (copied from `scripts/build-profilegate-panels-20261115.js`,
  panel-building logic UNCHANGED; only leg dirs, file names,
  seeds, pseudo-policy change) builds panels in the
  `scripts/balance-panel.js` schema from the two legs:
  before=leg 1 (main), after=leg 2 (replication), PAIRED
  seeds on the same tip, pseudo-policy `rumorplan-a` in both
  panels. The scorecard reads OFF→ON deltas per contract
  metric on paired seeds. Expected: no material signal —
  the two legs are the same policy on identical seeds, so
  the compare is a replication/neutrality check, and any
  signal is a nondeterminism finding, not a lever effect.
  The panel is the instrument; the prereg bars are the judge.
  The `compare` `.md` is attached to the evidence file.
- **Sibling-file note:** this arm touches NO src file. All
  files are new names under `scripts/rumorplan-*` and
  `evidence/2026-11-16/*rumorplan*` — no overwrite of the
  seedattach/dawnbid/profilegate instrument files, no merge
  sequencing needed on src.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** main leg tip, seed 102011, 60d,
  recorder ON, run twice → identical per-seed JSON
  (deaths/days/endReason/vet5 + all rumorplan rows identical).
- **D2 (wrap neutrality):** main leg tip, seed 102011, 60d,
  recorder ON vs recorder OFF (`RUMORPLAN_RECORDER=off`) →
  identical trajectories (deaths/days/endReason/standing/vet5
  + daily fingerprints). The recorder wraps are the only
  difference between the legs — D2 isolates them.
- **D3 (drift smoke):** `scripts/vetparty-drift-check.js` over
  the main corpus vs the replication corpus — first
  divergence on/after the first `v4seeds` day per seed; the
  two legs are the same policy on identical seeds, so the
  expected verdict is IDENTICAL on all 8 seeds, NO
  PRE-SEED DRIFT. Any divergence is a nondeterminism
  finding and fails the run. (The driver carries the same
  `v4seeds` rows + T-class fingerprints as seedattach, so
  the same check applies verbatim.)

## The instrument (frozen)

- Driver: `scripts/rumorplan-driver-20261116.js` (new — the
  seedattach driver extended, not rebuilt: same vetfirst
  T-class instrument, same `v4seeds` / `v4departs` /
  `v4gates` / `v4encounters` recorder, same dawnbid capture,
  same seedattach capture, PLUS the rumorplan rows below).
  Recorder wraps are pure reads plus writes to driver-local
  arrays — no game-state writes, no RNG. The driver refuses
  to overwrite an existing per-seed file.
  `RUMORPLAN_RECORDER=off` skips installing ALL wraps
  (inherited + new; used by determinism leg D2).
  `LEG=competent|tableseat-nowait` selects the leg policy
  (default tableseat-nowait for this arm). Errors are
  REPORTED into `instrumentErrors` (named, not swallowed).
- Rumorplan rows (per seed, in addition to every seedattach
  row):
  - `rumorplanLaunches` — per depart call that returns
    `launch`, ONE row PER PARTICIPANT (inviter + each
    companion): {day, vid, role: 'inviter'|'companion',
    path: 'winplan'|'brain', inviter, companion,
    stageBefore, targetBefore, needWaveBefore, nodeBefore,
    partyBefore, stageAfter, targetAfter, needWaveAfter,
    nodeAfter, partyAfter}. Before-state is captured BEFORE
    the call for every participant (the companion list comes
    from the pre-call plan party / the dawn commit, so the
    brain mirror's stage/target writes are visible as
    before→after diffs); after-state AFTER the call.
  - `rumorplanTargetDiffs` — per day-over-day target change
    found by the daily census diff (driver-local
    vid→{target,stage} map): {day, vid, from, to, stage,
    source: 'census-diff'}. Independent of the seed bounces:
    the companion copy (`win-plan.js:439`) sets targets
    without a seed call, and this row names the day any
    plan's target changes, whatever the mechanism.
  - Output also carries `wave5Ids` (live wave-5 list) next to
    `wave4Ids`.
- Analyzer: `scripts/analyze-rumorplan-a.js` (new). Builds
  plan-instances from the corpora (definitions above),
  prints the Q1 conversion table + Q2 launch-share table +
  lifecycle table + Q3 trip table + per-seed table + wall
  numbers for both legs, writes
  `evidence/2026-11-16/rumorplan-a-analysis.json`, exits
  non-zero on any bar failure.
- Panel builder: `scripts/build-rumorplan-panels-20261116.js`
  (new; see §15 above).
- Drift check: reuse `scripts/vetparty-drift-check.js` verbatim
  (it reads `v4seeds` + the T-class daily fingerprints — this
  driver's corpora carry both).
- Proof: `scripts/test-rumorplan-a.js` (new; see below).
  GREEN on the instrument tip before the main leg runs.

## Proof test

`scripts/test-rumorplan-a.js` proves, on synthetic fixtures and
live in-memory runs (no corpus numbers):

- Static: NO src diff on this branch (`git diff master...HEAD
  -- src/` empty — instrument-only); the driver wraps exist
  (incl. the per-participant launch wrap and the census-diff
  target wrap); the wave-4 AND wave-5 id sets match
  `src/data/monsters.json` exactly (10 + 10 ids); the
  taxonomy's code anchors still hold (two target-write sites,
  four hunt-entry sites, the seed early return + wave gate,
  the single plan-deletion site, the three hunt-exit sites,
  the launch-at-any-stage depart branch).
- Unit (classifier, synthetic fixtures): one fixture per
  bucket — companion-inherited via win-plan launch AND via
  brain mirror AND via the census-only fallback; seed-created
  (seed-create bounce, no creation row); haven-born × each
  sub-reason (fought-personally, heard-at-fire,
  created-by-read); seeded-then-lost (census target non-null
  → null); unknown (creation with a target but no matching
  rule); precedence (companion-inherited beats haven-born
  when both evidences present; seeded-then-lost beats
  haven-born; the same-day-launch exclusion); instances that
  never reach hunt are NOT in the population; repeat bounces
  group into ONE instance.
- Unit (lifecycle, synthetic fixtures): a rumor-born instance
  that converts (seed-set at party stage → hunt launch with
  a wave-4 target) is counted converted with the mechanism
  named; a rumor-born instance that launches target-null is
  launched-target-null; a hunt instance demoted by the
  outmatched gate is churned:hunt→party; a hunt instance
  whose holder dies is holder-died; a deleted-then-recreated
  plan is two instances, the first superseded; a party-stage
  launch with a wave-4 target counts as a wave-4+ launch but
  NOT as a hunt-stage launch.
- Unit (launches, synthetic fixtures): a wave-4+ launch share
  table over known launches sums to 1 with unknown 0; the
  strict subset is reported separately; a launch whose plan
  has only a wave-4 bounce (target null, needWave unset)
  counts in the broad set, not the strict set.
- Recorder: synthetic fixtures for the two rumorplan row
  shapes; a live in-memory run proves the launch wrap
  records BEFORE-state (stage hunt, target null) for BOTH
  participants and the census-diff wrap records a target
  change day.
- Determinism: D1 + D2 as frozen above (seed 102011, 60d).
- GREEN on the instrument tip before the main leg runs.

## Sense-testing

Quote ONE concrete rumor-born case end to end from the main
leg: what the villager planned, what the target was (null —
say so, or named — say so), what happened at dawn and on the
trip — with seed, day, villager, monster named, from
`v4encounters[].log[]` + the rumorplan rows. Do not invent
fight narrative from kill counts. Read a sample of up to 3
launched target-null trips' fight/encounter rows and judge
whether they hunt something real or wander.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 4 "The Mirror Draft",
  wave 5 "The Producers". Doc drift noted: the doc lists 9
  wave-4 monsters and 8 wave-5; the data has 10 and 10
  (`herald`; `finale_crew` / `finale_opening`).
- No canon doc covers plan-target attachment or the win-plan
  lifecycle — the win-plan system lives in `src/js/win-plan.js`
  (ontology header) and the dated evidence. This prereg says
  so rather than inventing canon.
- Prior evidence: `evidence/2026-11-15/sim-seedattach-a.md`
  (§"The answer, in the frozen rule's own terms" — this
  DIAG's subject) and `evidence/2026-11-15/sim-seedattach-a-prereg.md`
  (definitions reused; the seed call, the launch conditions,
  the gate bars).

## Correction 1 (2026-11-16, before any judged sim — instrument not yet built)

**C1 — a launch is an expedition START, not a depart-call
`'launch'`.** Both depart paths return `'launch'` again on later
days for a villager already out on expedition
(`villager-brain.js` early return when `a.exped[vid]` is already
set; `launchParty`'s exped check passes when already exped).
Counting those repeats as launches would inflate Q2. The driver
therefore records a `rumorplanLaunches` row ONLY when the call
STARTS the inviter's expedition (exped false → true; fail-open,
flagged `expedStart: 'unknown'`, if the expedition state cannot
be read), one row per participant, with before/after expedition
states on the row. Q2's unit is the LAUNCHED PLAN (one
participant row); a launched plan is wave-4+ iff its OWN plan
satisfies needWave ≥ 4 / target wave-4/5 / instance has a
wave-4 bounce in its history. The launch-EVENT table (events by
inviter-plan origin) is reported as secondary. Chance-roll
expeditions (`villager-agency.js` `R() < chance`
`startExpedition`, no plan involved) start no plan launch and
are not counted; the analyzer reports expeditions-without-a-
launch-row as a secondary residue check. The frozen definitions
above are otherwise unchanged.

## Correction 2 (2026-11-16, before any judged sim — instrument not yet built)

**C2 — bucket 2 is `haven-born`, not `haven-born-never-seeded`.**
The frozen population is EVERY hunt-stage instance, including
ones that reach hunt WITH a target (seeded at party stage — the
conversion shape itself). A plan born target-null at Haven and
later seeded is still haven-born by birth; the seedattach
`never-seeded` qualifier only fit that arm's population
(target-null AT the bounce, never seeded by construction).
Changes: (a) bucket 2 is renamed `haven-born` (sub-reasons
unchanged: `fought-personally` / `heard-at-fire` /
`created-by-read`, from the creation engagement reads); (b) a
`seededBeforeHunt` flag on each instance records whether a
seed-set event (bounce or census-diff, target null →
non-null) happened before hunt entry — the seedattach
comparison shape is `heard-at-fire` AND NOT `seededBeforeHunt`;
(c) precedence reorders to companion-inherited >
seed-created > seeded-then-lost > haven-born > unknown, so a
plan that HAD a target and lost it still lands in
seeded-then-lost rather than haven-born (the lost-target
evidence is the discriminator). Q1 is unchanged: conversion
is a rumor-born (`heard-at-fire`) instance with a hunt-stage
launch whose target is a wave-4+ monster.

## Metric review (to be filled in the evidence file)

Pre-registered here: if conversions are 0, the review will say
so with the denominator (rumor-born instances that launched
at hunt, and rumor-born instances overall) and name the
nearest miss (the rumor-born plan that came closest — e.g.
acquired a wave-3 target, or launched at party stage with a
wave-4 target); if conversions are non-zero, the review will
name each converting instance with its acquisition mechanism
and launch day. If the main leg opens far fewer hunt-stage
instances than seedattach's 10 bounce-instances (on its band),
the review will say so with both counts — the lifecycle is
judged on the instances that open, not on matching 10. If the
replication leg diverges anywhere from the main leg, the
review will name the seed and day (a nondeterminism finding,
not a lever effect). No re-scoring mid-run: the buckets and
launch definitions above are the judge.
