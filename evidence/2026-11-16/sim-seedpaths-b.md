# sim-seedpaths-b — DIAG: all four seed paths counted per instance and per launch

**Arm:** sim-seedpaths-b (Loop B, run `fleshout-loop-b-20261116T0915Z`, axis winnability chain).
**Prereg:** `evidence/2026-11-16/sim-seedpaths-b-prereg.md` (frozen; no
correction — the frozen design held as written).
**Prior art:** `evidence/2026-11-16/sim-poolmarginals-b.md` + prereg — the
instrument this arm EXTENDS (the seed-path extension);
`evidence/2026-11-16/sim-companionpool-b.md`;
`evidence/2026-11-16/sim-launchdef-a.md` (the gate-avoid seed path).
**Type:** DIAG — instrument + measured path distribution. No game change,
no default flipped.
**Seeds:** 102131–102138 (8-seed pilot, 150d death-aware, policy competent
verbatim, sha `74a890f0844e`). Band reused BY DESIGN (see prereg): the
identical corpus poolmarginals judged, so the path counts are comparable
to its 35 instances / 3 launches.
**Branch:** `sim-seedpaths-b`. **Worktree:** `~/workspace/worktrees/sim-seedpaths-b`.
**Base:** master `796fa96ca` at arm start (the worktree HEAD).

## GO verdict: GO — instrument valid, all five prereg bars pass

1. **Attribution coverage:** instrument leg **28/28 instances attributed
   (1.0 ≥ 0.90)**; control leg **3/3 (1.0 ≥ 0.90)**.
2. **Every unattributed instance reasoned:** **0 unattributed instances
   on either leg** — nothing to reason, and no bare `unknown` anywhere:
   0 unknown seed rows on either leg (127 instrument rows, 54 control
   rows, every one carrying a named path).
3. **Corpus:** 16/16 files parse (8 control + 8 instrument, identical seeds).
4. **Proof:** `scripts/test-seedpaths-b.js` **60/60** on the instrument tip
   (seed call on) and **60/60** in the off shape after the revert.
5. **Wall numbers reported** for both legs (below).

## Instrument built

`scripts/seedpaths-driver-20261116.js` extends the poolmarginals driver
(same vetfirst T-class instrument, same `v4seeds` / `v4departs` /
`v4gates` / `v4encounters` recorder, same dawnbid bid/census capture,
same companionPool first-fail capture + members extension) PLUS the
SEED-PATH EXTENSION: every `v4seeds` row now carries the path that
fired it — `world-tick` | `agency-evade` | `agency-flee` |
`gate-avoid` — classified in the `winPlanSeedFromFight` wrap from the
outcome string + the caller's stack frame, plus the first caller frame
recorded on the row for audit. The outcome alone does NOT disambiguate:
`'fled'` is shared by the world-tick call (`game.js`
`resolveWildMonsterEncounter`) and the agency flee call
(`villager-agency.js` `expeditionMonster`); the stack does. Anything
matching no rule is an explicit `unknown-*` path, never a silent
default. `scripts/analyze-seedpaths-b.js` requires the poolmarginals
analyzer (not copied) and reuses its `classifyMarginals`, then replays
the dawnbid seed-row state machine to tag each instance with its
opening row (first-seeder-wins) and all firings while live.
`scripts/test-seedpaths-b.js` is the proof (classifier fixtures for all
four paths + unknown cases, analyzer fixtures S1–S6, live recorder
shape, D1/D2, 150d path coverage). No game-code hook beyond the
re-landed seed call: the driver wraps `winPlanSeedFromFight` and
classifies from a pure-read stack capture (no RNG, no state).
`SEEDPATHS_RECORDER=off` skips the wraps (D2 leg).

**The four call sites, re-located in this tree** (prereg's cited lines
were starting points; all four drifted or held as noted):
- world-tick — `src/js/game.js` `resolveWildMonsterEncounter`, the
  13-line VETPARTY block re-landed verbatim before
  `if (rec.outcome === 'alreadyDead') {` (line 20935, as cited).
- agency evade — `src/js/villager-agency.js:660` (prereg cited :643),
  `expeditionMonster`, outcome `'evaded'`.
- agency flee — `src/js/villager-agency.js:743` (prereg cited :726),
  `expeditionMonster`, outcome `'fled'`.
- gate avoid — `src/js/win-plan.js:512` (as cited), `winPlanFightGate`,
  outcome `'avoided'`, only when no plan exists (the else-branch).

**Anchors.** Control anchor = `45d03c1fa` (instrument, seed call
ABSENT). Instrument anchor = `e7dc7b7ee` (seed call re-landed verbatim
— the 13-line block from revert `7ba893b4b`, blob `a66d45a5e`, the
exact blob the poolmarginals prereg cites). After measurement the seed
call was **reverted**; the branch's `src/` is byte-identical to the
control anchor (`git diff 45d03c1fa HEAD -- src/` = 0 lines).
Seed-call text is preserved verbatim in the prereg and in git history.

**Commits on this branch:** `d29e52ddb` (prereg), `45d03c1fa`
(instrument, control anchor), `e7dc7b7ee` (seed call, instrument
anchor); the evidence + analysis + corpora commit and the seed-call
revert commit follow in the branch log. Ready to merge, pending ship.

## Before / after on identical seeds

| | Control leg (seed call absent) | Instrument leg (seed call on) |
|---|---|---|
| Seeds / files | 8 / 8 | 8 / 8 |
| Instrument errors | 0 | 0 |
| Wave-4+ seed calls (wave ≥ 4) | 13 (54 seed rows total, all waves ≥ 3) | 68 (127 seed rows total) |
| Plan instances opened | **3** | **28** |
| Scored dawns (pool rows) | 19 | 95 |
| Launches | 2 | 7 |
| National by standing ≥200 / by scaleRank | 3 / 0 | 3 / 0 |
| Table / wins | 0 / 0 | 0 / 0 |
| Wave-4 reached / wave-5 reached | 8 / 3 | 8 / 3 |
| Median survival (gameDays) | 151d | 150.5d |
| Wave-4 kills / wave-5 kills | 30 / 5 | 25 / 3 |
| Deaths (all causes) | 559 | 579 |

Per-seed (instrument leg): 102131 survived 151d standing 199, 0
instances; 102132 survived 151d standing 450, 10 instances, 0 launches;
102133 survived 151d standing 370, 4 instances, 4 launches; 102134 lost
97d standing 199, 3 instances, 1 launch; 102135 survived 150d standing
410, 3 instances, 1 launch; 102136 survived 141d standing 199, 5
instances, 0 launches; 102137 survived 151d standing 199, 1 instance,
1 launch; 102138 lost 92d standing 199, 2 instances, 0 launches.
(The wall difference between legs on 8 seeds is noise; the seed call is
a DIAG instrument, reverted — do not read it as a lever effect.)

### The control leg reproduces poolmarginals exactly

Control: 3 instances, 2 launches — the SAME three instances
poolmarginals found, identical in every field: 102132 diana_osei →
reunion, gate-avoid, seedDay 150, candidate-not-bid (not-scored);
102137 rafael_torres → influencer, gate-avoid, seedDay 34, launched
with priya_nair; 102138 jovan_milic → reunion, agency-flee, seedDay
52, launched with gen_38psqq4. The 54 seed rows split identically too
(evaded 38, fled 14, avoided 2). The instrument is neutral on this
base: same band, same policy, same substrate, bit-identical control
trajectories to the arm this one extends.

## The distribution table (the result this arm exists for)

### Seed rows by path

| Path | Instrument rows, wave ≥ 3 | Instrument rows, wave ≥ 4 | Control rows, wave ≥ 3 | Control rows, wave ≥ 4 |
|---|---|---|---|---|
| world-tick | 56 (44.1%) | 41 (60.3%) | 0 | 0 |
| agency-evade | 47 (37.0%) | 14 (20.6%) | 38 (70.4%) | 8 (61.5%) |
| agency-flee | 23 (18.1%) | 12 (17.6%) | 14 (25.9%) | 3 (23.1%) |
| gate-avoid | 1 (0.8%) | 1 (1.5%) | 2 (3.7%) | 2 (15.4%) |
| unknown | **0** | **0** | **0** | **0** |

### Instances by first-seeder (first-seeder-wins)

| First seeder | Instrument instances (n=28) | Instrument launches (n=7) | Control instances (n=3) | Control launches (n=2) |
|---|---|---|---|---|
| world-tick | **27 (96.4%)** | **6 (85.7%)** | 0 | 0 |
| agency-evade | 0 | 0 | 0 | 0 |
| agency-flee | 0 | 0 | 1 (33.3%) | 1 (50%) |
| gate-avoid | 1 (3.6%) | 1 (14.3%) | 2 (66.7%) | 1 (50%) |
| unknown | 0 | 0 | 0 | 0 |

Multi-path instances (2+ named paths fired while live): instrument 3,
control 2. In every multi-path instance the later firings were
non-opening (the plan had already advanced past gear/party to
hunt/standing), so first-seeder-wins hides nothing — no later path
could have been the effective seeder. The firings lists keep the full
record for any re-count.

## The answer: the world-tick call owns the subject — and the other paths are independently live

**The world-tick path owns 96% of instances and 86% of launches on
the instrument leg.** Of 68 wave-4+ seed calls, 41 are world-tick; of
28 instances, 27 open on a world-tick row; of 7 launches, 6 launch
from a world-tick-seeded instance. The seed call is NOT a dead lever:
with it absent, 25 of those 28 instances never open — wild flees
leave no trace (the seedattach finding: 64 of 78 wave-4 flees leave
no trace), and the world-tick call is the only path that sees them.

**But the agency and gate paths are independently live, not vestigial.**
With the world-tick call absent they open every instance that exists
(3/3) and launch 2/2. And on the instrument leg they keep firing: 26
wave-4 agency rows and 1 gate row — they just land on holders whose
plan is already open (seeded earlier by a wild flee) or already
advanced past gear/party, so they refresh or no-op instead of
opening. The agency paths seed from a different kind of encounter
(expedition, not wild); the world-tick call does not pre-empt their
encounters, it adds a whole second stream of seeding opportunities
from wild flees that otherwise vanish.

**Gate-avoid is the rarest path and the most efficient.** One
instrument row, one instance, one launch — Rafael Torres, the same
instance on both legs, seeded day 34 when the gate turned him away
from an Influencer with no plan at all, launched with priya_nair,
closed day 115. A gate refusal that plants a plan is rare (3 rows
across both legs) but when it plants one, the plan launches.

**Agency-evade opened zero instances on either leg** despite 47 + 38
rows — every evade seed landed on a holder who already held a plan
for that species (a refresh) or whose plan had advanced (a no-op).
Evading seeds plenty; it opens nothing, because the evader almost
always already knows the beast. Agency-flee opened one (jovan_milic,
control leg).

## Three instances, told in full (sense-testing)

**Nina Petrova (wanderer, seed 102135, target strike):** 8 firings,
3 paths — the busiest instance in the band. Day 129 she flees a
Strike in the wild → world-tick seeds, stage party (she is geared).
Day 134 she flees the Strike again → world-tick refresh. Day 138 she
flees a Reunion twice — but her plan is already at hunt, so both
calls no-op and the target stays strike. Days 141–145 she evades a
spool on expedition, flees a congregation and a timeslot on
expedition, flees an eater in the wild — all while the plan sits at
hunt, all recorded as firings of the still-live strike instance, none
retargeting it. She launches with ethan_hunt. The recorded paths
match the narration exactly: world-tick rows are wild flees, agency
rows are expedition encounters. First-seeder world-tick is right —
the wild flee on day 129 is what planted the plan.

**Rafael Torres (wanderer, seed 102137, target influencer):** the
gate-avoid instance, identical on both legs. Day 34 the gate turns
him away from an Influencer, outmatched, with no plan → gate-avoid
seeds, stage party. Days 41–86 he evades a congregation, a reunion,
a gavel, an algorithm, a focus_group, a terms_of_service on
expedition — all while the plan is at hunt, all no-ops. He launches
with priya_nair. First-seeder gate-avoid is right: the gate's refusal
is what planted the plan; the later evades never re-seed. The
world-tick call added nothing on this seed (no world-tick row fired;
first-world-tick day null; the two legs are identical on every
reported field).

**app_mgpsphw9529 (wanderer, seed 102133, target herald):** day 112
flees a Herald in the wild → world-tick seeds. Day 114 flees a
redactor (wave 3) on expedition → agency-flee fires, plan already at
hunt, no-op. Launches with somchai_prasert the same day Adaeze
Nwosu launches with app_mgpsphw9529 for the same beast — the party
exists where rangers exist, as poolmarginals found.

## Reachability verdict for the wave-4 chain

**Reachable, and this band launches more than poolmarginals'.** 28
instances, 7 launches, 0 target-kills (instrument leg). Bucket split:
launched 7, selected-blocked 1 (`selected-not-executed`), churned 9
(6 holder-died, 2 plan-deleted, 1 retargeted), candidate-not-bid 11
(all `no-companion-party`), unknown 0. The launches cluster on seed
102133 (4 of 7, all herald, all ranger holders). The 11
candidate-not-bid instances are the poolmarginals story unchanged:
the holder bids and finds no companion. Wave-5 targets: 8 of 28
instances (editor 4, timeslot 1, cancellation 1, network_note 2) —
all first-seeded world-tick, none launched.

## Village assessment, in plain words

The villages on this band are the same villages poolmarginals
measured — the control leg is bit-identical — but with the seed call
on, the story changes shape. Wild flees now plant plans: 27
instances where there were 3, and 7 parties walk where 2 walked.
The chain works when the seed lands early and the holder lives long
enough to use it: the launches are all ranger holders, and the
churn is mostly holders dying (6 of 9) before the dawn ever picks
the trip. Seed 102132 opens 10 instances and launches none — ten
villagers who remember a beast, and every one of them dies, is
retargeted, or finds no companion. The seed is not the bottleneck
anymore; the bottleneck is still the pool and the dying. The scale
wall does not move on 8 seeds: national by standing 3, by rank 0,
table 0, wins 0 on both legs.

## Sense-testing (read the lines, not just the counts)

- **The fights read like fights.** Seed 102131, day 51 — Ava vs the
  Eater, 1 round:
  > "Ava walks straight into The Eater. No avoiding it."
  > "Ava's gear absorbs 33."
  > "R1: Gorge hits Ava for 31 (18 left)"
  > "R1: Ava strikes for 15 (1062 left)"
  She walks in, takes 31, deals 15 against 1062 HP, and flees — and
  that flee is exactly the world-tick seed row for her strike plan.
  The seed and the story are the same event.
- **The evade reads like an evade.** Seed 102131, day 58 — Ines vs
  the Suburb, 0 rounds:
  > "Ines saw The Suburb in time and gave it room."
  No fight, no seed from the world-tick call (evades never seed
  there) — and the row, when an evade does seed, comes from the
  agency path with the expedition context, not from this sighting.
- **The rage reads like rage.** Seed 102131, day 57 — Mabel vs the
  Audit, 3 rounds:
  > "Mabel's eyes go red. Next 3 strikes hit twice as hard. (Rage)"
  > "Mabel's gear absorbs 51."
  > "R1: Assessment hits Mabel for 23 (25 left)"
  She rages, absorbs, and still flees at 25 HP.
- **Wave-4 fights overall (instrument leg):** 132 encounters. Fleeing
  remains the normal outcome, as in dawnbid's and companionpool's
  bands. The veteran-death silence persists: the instrument leg's
  `vetSays` lines were not re-audited for veteran-death lines this
  arm (poolmarginals found 0 in 352); not re-claimed here.
- **One path/name check, clean:** every recorded `world-tick` row's
  caller frame is `resolveWildMonsterEncounter` (game.js), every
  `agency-*` row's is `expeditionMonster` (villager-agency.js:660
  evade / :743 flee), every `gate-avoid` row's is `winPlanFightGate`
  (win-plan.js:512). No row's path contradicts its caller — the
  classifier was also verified against the live 150d proof run (9
  rows: 5 world-tick, 3 agency-flee, 1 agency-evade, all named).

## Blanks filled or documented

- **Poolmarginals' named next diagnostic #4, closed.** All four seed
  paths counted per instance and per launch, on the identical corpus:
  world-tick 27/28 instances, 6/7 launches; gate-avoid 1/1; agency
  paths 0 instances on the instrument leg but 3/3 on the control leg.
- **A fifth plan-creation path, named (not counted).** Seed 102131
  carries plans on both legs (99/36 score rows, 22/12 departs) with
  ZERO seed rows and ZERO instances: the plans were created by
  `winPlanHavenTick` (win-plan.js) knowledge-seeding — a ranger at
  Haven who has fought a beast, or whose village has slain one,
  starts a plan without any `winPlanSeedFromFight` call. HavenTick
  plans never open a dawnbid instance by definition (instances open
  only on seed rows), so they are outside this arm's four-path frame,
  not a missed wrap — but the family story ("a plan starts when a
  seed fires") is incomplete until havenTick is counted the same way.
  Noted for the findings backlog (coordinator appends).
- **The away-flag/node disagreement (poolmarginals' open finding) is
  untouched by this arm** — no new data either way.
- **Index clobber (safe-commit):** struck on all three commits this
  run (staged-deleted + untracked twice, `MM` on game.js once).
  Repaired each time via `git ls-tree -r HEAD -- <paths> | git
  update-index --add --index-info`, verified with `git status` clean
  + `git diff HEAD` empty + hash-object match. All commits verified
  correct after repair.

## Metric review

- The frozen definitions held — no mid-run re-scoring. The wave-4-only
  cut is reported in the table above (wave ≥ 4 rows split out); the 8
  wave-5-target instances are counted in the pooled first-seeder table,
  as frozen (the split by target wave was not computed beyond the
  row counts — the table is pooled over all 28 instances).
- **First-seeder-wins hid nothing.** All 3 multi-path instrument
  instances (and both control ones) have their later firings as
  non-opening calls on a plan already past gear/party — no later path
  could have been the effective seeder. The firings lists preserve
  the full record for any re-count.
- **No wrap missed a seeding.** 0 unknown rows on either leg; every
  instance attributed; every seed row's path matches its caller frame.
  The havenTick path (above) is a plan-creation path, not a missed
  seed hook — it never calls `winPlanSeedFromFight`.
- **150d was the right horizon.** Instances open as late as day 148
  (102132) and 145 (102135); a 100d horizon would have missed
  102132's late cluster and all of 102135's instances. The tail
  matters for this subject.
- **Control-leg reproduction: exact.** Poolmarginals' control leg
  (3 instances / 2 launches, 54 rows 38/14/2) reproduces bit-for-bit
  on this base — same holders, targets, seed days, companions. The
  instrument leg differs from poolmarginals' (28 vs 35 instances, 7
  vs 3 launches) — a trajectory difference on the newer base, not an
  instrument difference: the control leg proves the instrument
  neutral on this base, and D3 is clean on both the loose and the
  strict read (below). The 7 launches (vs 3) cluster on one seed's
  herald party — band variance, not a lever claim.
- **The prereg's "≥90% attributed" bar passed at 1.0 on both legs,**
  so the instrument is valid. The interesting result is the table
  itself: the world-tick call owns the subject, and the agency/gate
  paths are independently live without it.

## Balanced-panel review note (why no panel)

No balanced panel was run for this DIAG, same as dawnbid,
companionpool, and poolmarginals. The panel
(`scripts/balance-panel.js`) measures a lever's effect on wins /
survival across policies; this arm ships no game change — the seed
call is reverted, the instrument is observation-only, and the prereg
bar is the judge. A panel on both legs would measure the seed call's
noise, not a lever. The neutrality proof (D1/D2/D3) is the panel's
substitute here, and it is clean.

## Neutrality evidence

- **D1** (proof test): instrument tip, seed 102131, 60d, recorder ON
  twice — identical full corpus (including `v4seeds` rows WITH path
  + caller fields).
- **D2** (proof test): same, recorder ON vs OFF — identical
  trajectories.
- **D3** (drift smoke, `scripts/vetparty-drift-check.js` over both
  corpora): CLEAN on all 8 seeds, NO PRE-LEVER DRIFT. First
  divergence days 42/35/114/41/130/35/—(identical)/36 vs first
  `v4seeds` days 32/31/112/39/29/34/34/34. Seed 102137 is IDENTICAL
  across legs on every reported field.
- **D3 strict read (first WORLD-TICK seed day, computed in the
  analysis):** first world-tick days 39/31/112/39/129/34/—/34 vs the
  same first-divergence days — clean on all 8 seeds too, including
  102135 (diverges day 130, first world-tick seed day 129) and
  102131 (diverges day 42, first world-tick seed day 39).
- **Proof:** 60/60 on the instrument tip, 60/60 in the off shape
  after the revert.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-16/perseed-seedpaths-b-on/*.json' --metrics
national,table,wins,exiled` — **REFUSED**, as the recent DIAGs hit:
"telemetry-check: refusing recorder-corpus input: all 8 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs. Recorder
corpora are compared with sweep-compare tables, never against a run baseline
here." Recorded, not worked around; the baseline was not rolled on it.

## Files

- Prereg: `evidence/2026-11-16/sim-seedpaths-b-prereg.md`
- Instrument: `scripts/seedpaths-driver-20261116.js`, `scripts/analyze-seedpaths-b.js`,
  `scripts/test-seedpaths-b.js`
- Corpora: `evidence/2026-11-16/perseed-seedpaths-b-control/` (8 files),
  `evidence/2026-11-16/perseed-seedpaths-b-on/` (8 files)
- Analysis: `evidence/2026-11-16/seedpaths-b-analysis.json`
- This evidence file: `evidence/2026-11-16/sim-seedpaths-b.md`

## Next diagnostic (named, not done)

1. **HavenTick plan-creation, counted the same way.** Seed 102131
   proves plans exist that no seed path ever fires for. A next DIAG
   should count havenTick-created plans per instance (a fifth path)
   and say how many launches they produce — the four-path table is
   complete for seed calls, but the plan-creation story is not.
2. **Why agency-evade opens nothing.** 85 evade rows across both
   legs, 0 instances opened — every evade lands on a holder who
   already holds the plan. Whether evades mostly hit already-seeded
   holders (because the same beast was already fled in the wild) is a
   question for the seed-attach family, not this DIAG.
3. **The 102132 ten-instances-zero-launches pattern** — ten seeded
   plans, no party walks — is the pool/churn story in miniature;
   Loop A's profilegate arm owns the pool question.

**Note for the coordinator:** `src/js/game.js` was touched (seed call,
now reverted; branch `src/` is byte-identical to the control anchor).
Sequence merges if a sibling arm also touches it. Loop A is live on
sim-gateconfirm-a and sim-killfail-a — this arm touched none of those
files. Findings to append to `hidden_files/sim-findings.md`: the
havenTick fifth plan-creation path (above).
