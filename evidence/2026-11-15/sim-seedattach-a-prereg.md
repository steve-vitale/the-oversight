# sim-seedattach-a — PREREG (binding)

Run: fleshout-20261116T0446Z (Loop A), axis scale-onramp, arm
sim-seedattach-a — DIAG: why hunt-stage plans go target-null, and
whether attaching a seed (a target) at plan creation would fix it.
Branch `sim-seedattach-a` (worktree
`~/workspace/worktrees/sim-seedattach-a`). Base: master `d39ce6e8c`
at arm start. Binding prereg: THIS file — frozen before any judged
sim. The instrument (driver, analyzer, proof test) is built AFTER
this commit; no judged numbers exist yet. DIAG, instrument-only:
NO src/js change in this arm.

## The question, in plain words

The 0315Z run's dawnbid DIAG (`evidence/2026-11-15/sim-dawnbid-a.md`)
decomposed the wave-4 re-engagement chain, but its control leg
found 9 seed calls, 0 instances — all 9 bounced off hunt-stage
target-null plans, so the seed never attached. Open question
(tracker blank 3): why do hunt-stage plans go target-null, and
would attaching a seed (a target) at plan creation fix it?

## Prior art (read first)

- `evidence/2026-11-15/sim-dawnbid-a.md` + prereg — the 9-bounce
  control-leg finding; the 24-instance decomposition; the
  vetfirst T-class instrument, the `v4seeds` / `v4departs` /
  `v4gates` / `v4encounters` recorder, the drift-check pattern.
- `evidence/2026-11-15/sim-vetparty-a.md` — the 106-seed result.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md` (wave 4
  "The Mirror Draft"; doc lists 9 wave-4 monsters, the data has 10
  — herald — the data rules), `docs/PARTY.md`,
  `docs/VILLAGER-BRAIN.md` (one-brain contract: Phase 1 dawn
  scorer; the brain owns dawn).

## Code facts the taxonomy is built on (read from src, frozen)

Verified on this tree before this prereg (`src/js/win-plan.js`,
`src/js/villager-brain.js`, `src/js/villager-agency.js`):

1. `plan.target` is written in EXACTLY TWO places:
   - `winPlanSeedFromFight` (`win-plan.js:239`): `plan.target =
     mdef.id`, but ONLY when the plan stage is `gear` or `party`.
     For `hunt` / `standing` / `table` it returns the plan
     unchanged (line 255) — the seed bounces.
   - `winPlanDepart.launchParty` (`win-plan.js:439`): the
     companion's plan copies the inviter's target
     (`cplan.target = plan.target`) — a null target copies as null.
2. NOTHING ever writes `target` back to null. There is no
   clearing path in the code. A plan that once had a target
   cannot lose it except by plan deletion.
3. Plans are created target-null in three places: `winPlanOf`
   (`win-plan.js:218`, lazy create — also called as a read by
   the brain, which creates as a side effect);
   `winPlanHavenTick` (`win-plan.js:314`, engagement creation:
   the villager personally fought a beast — `know.fought`
   non-empty — OR the village has slain one, the fire-talk
   channel `villageSlain`); `winPlanSeedFromFight`
   (`win-plan.js:235`, creates then IMMEDIATELY sets the
   target — never null after).
4. Stage `hunt` is set in EXACTLY FOUR places:
   `win-plan.js:435` (launchParty inviter) and `:439`
   (companion copy, target included); `villager-brain.js:1047`
   (brain-mirror inviter) and `:1049` (brain-mirror companion —
   sets stage + party ONLY, does NOT copy the target: a fresh
   companion plan keeps its null target).
5. Live seed call sites on current master (this arm re-lands
   NOTHING): `villager-agency.js:643` (`'evaded'`),
   `:726` (`'fled'`), `win-plan.js:512` (`'avoided'`, via the
   fight gate). `src/js/game.js` has NO seed call — the
   world-tick call is gone (dawnbid revert).
6. Consequence: a hunt-stage target-null plan can arise ONLY
   by two provenances — (a) haven-born: created target-null at
   gear, advanced gear → party → hunt with no seed ever setting
   a target; or (b) companion-inherited: created as a launch
   companion copy of an inviter whose target was null. The
   recorder must still CHECK for a third (seeded-then-lost) via
   census diffs; the code says it cannot happen.

## The task brief's example buckets — prereg finding

The brief's example buckets ("target died before departure" /
"target exists but is out of range or at an unknown location")
presuppose a target ENTITY. A null target has no entity, so
those buckets are INAPPLICABLE to the primary subject and are
NOT forced into the taxonomy. They are recorded instead as
context on every bounce: `plan.node` at bounce (null = no
location known; set = a location is known but no beast is
named), plan age in days (`day - sinceDay`), and repeat-bounce
count. Seed bounces on hunt/standing/table plans that DO have
a target are a SECONDARY count (`already-targeted`): the seed
cannot retarget those either, but that is a different question
(a committed plan, not a null one).

## Frozen definitions

- **Wave-4 monster ids** (from `src/data/monsters.json`, wave 4;
  10, re-read live by the driver): `congregation`, `strike`,
  `influencer`, `audit`, `reunion`, `suburb`, `eulogy`,
  `algorithm`, `eater`, `herald`.
- **A target-null hunt-stage plan instance** (the subject) opens
  at the FIRST wave ≥ 4 seed call whose BEFORE-state plan is
  stage `hunt` and target `null`. Epoch key: (vid, sinceDay,
  huntEntryDay) — huntEntryDay from the first census / launch
  observation of stage `hunt`, falling back to the first-bounce
  day. Later seed calls bouncing off the SAME epoch are repeat
  bounces (counted, not new instances). An instance closes
  when the plan's target becomes non-null, its stage leaves
  `hunt`, the plan is deleted, the holder dies, or the run ends.
- **Provenance reconstruction:** the recorder captures plan
  CREATION events (wrap `winPlanOf`: before-null → after-exists,
  with a stack frame naming the creator site + engagement reads
  at creation: `know.fought` list, `villageSlain` total; wrap
  `winPlanHavenTick`: before-null → after-exists + the same
  engagement reads), LAUNCH events (wrap `winPlanDepart` and
  `vbrainExecuteDepart`: inviter, companion, inviter target
  before launch, launch path `winplan` vs `brain`), SEED events
  (wrap `winPlanSeedFromFight`: BEFORE/AFTER stage + target —
  the dawnbid recorder kept after-state only, which cannot
  prove a bounce), and a DAILY CENSUS of ALL winPlan entries
  (dawnbid's census filtered to wave-4 plans only, which
  MISSES target-null plans — `needWave` is unset until a seed
  sets it; this census records every plan: stage, target,
  needWave, party, sinceDay, node, holder alive/node/exped).
- **Buckets — exactly one per instance, precedence in this
  order (first match wins):**
  1. `companion-inherited` — the plan entered `hunt` as a
     launch companion copy with the inviter's target null.
     Evidence: a launch event with vid as companion and
     inviter target null on/before epoch open, OR first
     census sighting at stage `hunt` with party `[inviter]`
     and the inviter's plan target null that day. Covers
     BOTH launch paths (win-plan copies the null target;
     the brain mirror leaves the fresh companion plan null).
  2. `haven-born-never-seeded` — the plan was created
     target-null and reached `hunt` with NO seed-set event
     (target null → non-null) anywhere in its recorded
     history. Sub-reason from the engagement reads at
     creation (most informative first): `fought-personally`
     (`know.fought` non-empty — the villager DID fight a
     beast, but the plan never named it); `heard-at-fire`
     (`villageSlain` only — rumor-only, no beast the
     villager met); `created-by-read` (neither engaged at
     creation — a lazy `winPlanOf` read created the plan,
     engagement came later).
  3. `seeded-then-lost` — a non-null target was observed for
     the plan in an earlier census or seed event, and a null
     target later. The code says no clearing write exists;
     EXPECTED 0. Any instance here must name the transition
     days in the evidence.
  4. `unknown` — fits none of the above (analyzer bug). Must
     be 0. Any instance the analyzer cannot place lands here
     and fails the run.
- **Instrument error:** any non-empty `instrumentErrors`, any
  per-seed file failing to parse, any seed whose unlock/kill
  fields disagree (same rule as the dawnbid prereg).

## The verdict rule (frozen — what the DIAG judges)

This DIAG judges ONLY whether seed-attach is even applicable,
from the dominant bucket (+ sub-reason):

- Dominant `haven-born-never-seeded` with sub-reason
  `fought-personally` → seed-attach IS applicable: the
  villager fought a beast the plan never named. Name the
  exact attach point: `winPlanHavenTick` engagement creation
  (set `plan.target` from the fought beast) and/or relaxing
  the `winPlanSeedFromFight` early return so a hunt-stage plan
  can be retargeted.
- Dominant `haven-born-never-seeded` with sub-reason
  `heard-at-fire` → seed-attach CANNOT help: the plan was
  born from fire talk, no beast was ever met to attach. Say so
  plainly; the next arm must aim elsewhere (e.g. the plan
  should not reach `hunt` on rumor alone).
- Dominant `companion-inherited` → seed-attach applies only
  through the INVITER: name the inviter's bucket. If the
  inviter is `fought-personally`, attaching at the inviter
  fixes the companion too (the copy carries it). If the
  inviter is `heard-at-fire`, neither has a beast to attach.
- Dominant `seeded-then-lost` (unexpected) → the clearing path
  must be found and named before any attach talk; seed-attach
  is the wrong lever until then.

## Primary metric + GO bar (frozen)

GO (DIAG-GO: instrument valid, decomposition measured) iff ALL
hold:

1. **≥90% of target-null hunt-stage plan instances classified,
   0% in `unknown`.** (Three substantive buckets cover every
   code path, so 100% is expected; the 90% bar allows
   analyzer-edge misses, but `unknown` must be exactly 0.)
2. **Corpus 8/8 files parse** (main leg, identical seeds).
3. **Neutrality proven:** drift smoke clean (no pre-seed
   divergence on any seed) AND determinism legs green (D1 +
   D2 below).
4. **Proof test `scripts/test-seedattach-a.js` green.**

This is a DIAG: GO means the instrument is valid and the
decomposition is measured. It is NOT a lever GO — no game
change is judged, and nothing ships from this arm except the
instrument + evidence. A GO with dominant `heard-at-fire`
still says "seed-attach cannot help" — that IS the answer.

## Secondary (reported, not judged)

- Bucket shares + counts (per bucket and sub-reason); the
  decomposition table the next lever arm reads first.
- Per-seed table: bounce instances opened, seed calls (wave ≥ 4
  and wave 3), repeat bounces, `already-targeted` secondary
  bounces, gear/party opens, no-plan creates.
- Wall numbers (BOTH legs): national / table / wins, wave-4/5
  unlocks, median survival.
- Sense check: quote ONE concrete target-null case end to end
  (what the villager planned, what the target was, what
  happened at dawn) from the main leg's `v4encounters[].log[]`
  and the seed-attach rows — name seed, day, villager, monster.

## Seed band (verified fresh per the seed-band-freshness skill)

- **100871–100878** (8 seeds), 150d death-aware.
- Main leg: **competent verbatim**
  (`scripts/policies/competent.js`, sha `74a890f0844e` —
  same as dawnbid, verified by this arm with sha256sum before
  this commit; the driver's own-policy record carries the sha
  it ran under). The standing fix marker (`ROSTER CHECK`) is
  present in `src/js/standing.js` on this tree — no swap needed.
- Baseline leg: **tableseat-nowait**
  (`scripts/policies/tableseat-nowait.js`, sha `a11a1abc672e`)
  on IDENTICAL seeds — RE-RUN on this band, no copied numbers.
  Reference only (NOT this run's baseline): the 0315Z control
  leg on ITS band (100861–100868, competent) was national 3/8,
  table 0, wins 0, median 138.5d.
- Freshness check (this arm, before this commit — scope and
  result): zero hits for `10087[1-8]` and for the exact seeds
  100871–100878 in (a) all `*.md` under `evidence/`, (b)
  `scripts/*.js` driver band literals, (c) per-seed filenames
  under `evidence/` (no `10087*` file), (d) the goal
  `hidden_files/` tracker, lever-claims, and findings `.md`.
  The ONLY `.json` hits are float fragments: `100876666` in
  `evidence/2026-10-17/feastvoice-b-beats/belongfeast-s6105.json`
  and `"dutyPreserved": 100876` (a kcal value) in
  `evidence/2026-10-20/perseed-glutprobe-b/leadfeast.json` —
  neither is seed-band usage, matching the coordinator's
  verification. Neighbouring used bands: 100861–100868
  (dawnbid/ammocensus), 100821–100828 (vetparty pilot).
- NEVER 100521–100536, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568
  (task-forbidden bands).

## Horizon, policy, legs, panel applicability

- Horizon 150 days, death-aware (dead villages stop
  simulating).
- Leg 1 (judged): competent + recorder, seeds 100871–100878.
- Leg 2 (baseline): tableseat-nowait + recorder, identical
  seeds. The recorder is neutral (proven by D1/D2), so leg 2
  also yields classification instances as a cross-check; the
  JUDGED classification is leg 1 only.
- **§15 balanced panel — NOT run as a `compare`, frozen
  decision:** `tableseat-nowait` is not a panel-registered
  policy (`scripts/sweep-compare.js` `POLICY_REGISTRY` has no
  such entry; `competent` is registered). Registering it
  additively would move the panel's observer identity
  (`registrationDigest` keeps registrations for the panel's
  own policies) and force a proof refresh mid-DIAG. The two
  recorder legs on identical seeds ARE the before/after
  comparison — paired, same code, different policies — and
  the analyzer's per-leg wall table is the comparison
  instrument. No `compare` `.md` is attached; this paragraph
  is the record of why.
- **Sibling-file note:** this arm touches NO src file. All
  files are new names under `scripts/seedattach-*` and
  `evidence/2026-11-15/*seedattach*` — no overwrite of the
  dawnbid/vetparty instrument files, no merge sequencing
  needed on src.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** main leg tip, seed 100871, 60d,
  recorder ON, run twice → identical per-seed JSON
  (deaths/days/endReason/vet5 + all seedattach rows identical).
- **D2 (wrap neutrality):** main leg tip, seed 100871, 60d,
  recorder ON vs recorder OFF (`SEEDATTACH_RECORDER=off`) →
  identical trajectories (deaths/days/endReason/standing/vet5
  + daily fingerprints). The recorder wraps are the only
  difference between the legs — D2 isolates them.
- **D3 (drift smoke):** `scripts/vetparty-drift-check.js` over
  the main corpus — first divergence on/after the first
  `v4seeds` day per seed; NO PRE-SEED DRIFT. (The driver
  carries the same `v4seeds` rows + T-class fingerprints as
  dawnbid, so the same check applies verbatim. The recorder
  itself cannot diverge anything — D3 is the smoke that
  proves it.)

## The instrument (frozen)

- Driver: `scripts/seedattach-driver-20261115.js` (new — the
  dawnbid driver extended, not rebuilt: same vetfirst T-class
  instrument, same `v4seeds` / `v4departs` / `v4gates` /
  `v4encounters` recorder, same dawnbid capture, PLUS the
  seedattach rows below). Recorder wraps are pure reads plus
  writes to driver-local arrays — no game-state writes, no
  RNG. The driver refuses to overwrite an existing per-seed
  file. `SEEDATTACH_RECORDER=off` skips installing the wraps
  (used by determinism leg D2). `POLICY=competent|tableseat-nowait`
  selects the leg policy (default competent). Errors are
  REPORTED into `instrumentErrors` (named, not swallowed —
  the dawnbid empty-catch deviation is not repeated).
- Seedattach rows (per seed):
  - `seedattachBounces` — per `winPlanSeedFromFight` call
    (wave ≥ 3): {day, vid, mid, wave, outcome,
    stageBefore, targetBefore, nodeBefore, stageAfter,
    targetAfter, nodeAfter, planSinceDay, planParty}.
  - `seedattachCreations` — per plan creation (wrap
    `winPlanOf` + wrap `winPlanHavenTick`): {day, vid,
    createdBy: 'winPlanOf'|'winPlanHavenTick', creatorSite
    (first stack frame outside win-plan.js, or null),
    fought: [species ids], villageSlainTotal,
    stageAtCreation, targetAtCreation}.
  - `seedattachLaunches` — per `winPlanDepart` /
    `vbrainExecuteDepart` launch for a plan holder:
    {day, vid, path: 'winplan'|'brain', result,
    inviterTargetBefore, companion, companionTargetBefore,
    companionTargetAfter}.
  - `seedattachCensus` — once per day, EVERY live winPlan
    entry: {day, vid, target, needWave, stage, party,
    sinceDay, node, holderAlive, holderNode, holderExped,
    holderSick, holderHealth}.
- Analyzer: `scripts/analyze-seedattach-a.js` (new). Builds
  plan-epochs from the corpora (definitions above), prints
  the bucket table + sub-reason breakdowns + per-seed table +
  wall numbers for both legs, writes
  `evidence/2026-11-15/seedattach-a-analysis.json`, exits
  non-zero on any `unknown` instance.
- Drift check: reuse `scripts/vetparty-drift-check.js` verbatim
  (it reads `v4seeds` + the T-class daily fingerprints — this
  driver's corpora carry both).
- Proof: `scripts/test-seedattach-a.js` (new; see below).
  GREEN on the instrument tip before the main leg runs.

## Proof test

`scripts/test-seedattach-a.js` proves, on synthetic fixtures and
live in-memory runs (no corpus numbers):

- Static: NO src diff on this branch (`git diff master...HEAD
  -- src/` empty — instrument-only); the driver wraps exist
  (`winPlanOf`, `winPlanHavenTick`, `winPlanSeedFromFight`,
  `winPlanDepart`, `vbrainExecuteDepart` — driver-side); the
  wave-4 id set matches `src/data/monsters.json` wave 4 exactly
  (10 ids); the two target-write sites and four hunt-entry sites
  named in this prereg still exist in the code (the taxonomy's
  anchors — if the code moved, the test fails LOUD rather than
  classifying against stale anchors).
- Unit (classifier, synthetic fixtures): one fixture per bucket
  — companion-inherited via win-plan launch AND via brain
  mirror; haven-born-never-seeded × each sub-reason
  (fought-personally, heard-at-fire, created-by-read);
  seeded-then-lost (census target non-null → null);
  unknown (no creation, no launch, no history); precedence
  (companion-inherited beats haven-born when both evidences
  present); repeat bounces group into ONE instance;
  already-targeted bounces counted secondary, not instances;
  gear/party opens and no-plan creates are not instances.
- Recorder: synthetic fixtures for the four seedattach row
  shapes; a live in-memory run proves the seed wrap records
  BEFORE-state (stage hunt, target null) and the creation wrap
  records the creator site without changing the plan.
- Determinism: D1 + D2 as frozen above (seed 100871, 60d).
- GREEN on the instrument tip before the main leg runs.

## Sense-testing

Quote ONE concrete target-null case end to end from the main
leg: what the villager planned, what the target was (null —
say so), what happened at dawn — with seed, day, villager,
monster named, from `v4encounters[].log[]` + the seedattach
rows. Do not invent fight narrative from kill counts.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 4 "The Mirror Draft".
  Doc drift noted: the doc lists 9 wave-4 monsters; the data
  has 10 (herald).
- `docs/PARTY.md` — the party concept this chain test-cases.
- `docs/VILLAGER-BRAIN.md` — the one-brain contract: Phase 1
  (dawn scorer; drive candidates as scorer candidates),
  §9 (win prices / deed gates / readiness bars untouched;
  perception law).
- No canon doc covers plan-target attachment — the win-plan
  system lives in `src/js/win-plan.js` (ontology header) and
  the dated evidence. This prereg says so rather than
  inventing canon.
- Prior evidence: `evidence/2026-11-15/sim-dawnbid-a.md`
  (§"The control leg's finding" — this DIAG's subject) and
  `evidence/2026-11-15/sim-dawnbid-a-prereg.md` (definitions
  reused; the seed call, the launch conditions, the gate bars).

## Metric review (to be filled in the evidence file)

Pre-registered here: if the decomposition lands mostly in
`haven-born-never-seeded`, the review will name the dominant
sub-reason (fought-personally vs heard-at-fire) with the
creation-event counts; if it lands in `companion-inherited`,
the review will name the inviters' buckets (the attach point
lives or dies there); if `seeded-then-lost` is non-zero, the
review will name the transition days and the code path that
cleared the target (the prereg's code read says none exists).
If the main leg opens far fewer instances than dawnbid's
control leg found bounces (9 on its band), the review will
say so with both counts — the decomposition is judged on the
instances that open, not on matching 9. No re-scoring mid-run:
the buckets above are the judge.
