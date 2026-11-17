# sim-part2target-a — PREREG (binding)

Run: fleshout-20261117T1535Z (Loop A), axis scale-onramp, arm
sim-part2target-a — DIAG, instrument-only: survey WHERE part-2
commits carry targets, classify each as target-carrying vs
targetless, and for target-carrying commits record what happens
at the night tick and how often a target survives to a dawn
launch. Branch `sim-part2target-a` (worktree
`~/workspace/worktrees/sim-part2target-a`). Base master
`0668af726` at arm start. Binding prereg: THIS file — frozen
before any judged sim. The instrument (driver, analyzer, panel
builder, proof test) is built AFTER this commit; no judged
numbers exist yet. Leg (a) below is a RE-READ of existing
corpora (no new sims); its numbers are recorded here because
they were computed before this commit, from files already in
the repo.

## The question, in plain words

A villager commits mid-day (part 2) to lead a party out after
a beast. The 1415Z run found all six such commits on band
103411–103418 were TARGETLESS — no named beast, plans at
hunt/party stage — so the hold-to-dawn counterfactual's "same
target" condition never bit, and the named-beast hold case is
unmeasured. This DIAG measures where part-2 commits DO carry
targets: survey part-2 commits across bands and horizons,
classify each as target-carrying vs targetless, and for the
target-carrying ones record the night-tick fate (held to dawn?
launched? died? target still valid at dawn?) and how often a
target survives to a dawn launch. This is a DIAG: the GO is on
instrument validity + classification completeness, not on
finding targets. A measured zero is a GO if the search space is
fully documented.

## Prior art (read first)

- `evidence/2026-11-17/sim-part2night-a.md` + prereg — the
  finding this arm starts from: 6/6 part-2 commits targetless
  on band 103411–103418; the "same target" condition vacuous;
  named-beast hold unmeasured. Finding #2425 in
  `sim-findings.md` (the targetless shape inside it).
- `evidence/2026-11-17/sim-launchfunnel-a.md` + prereg — the
  wider corpora re-read in leg (a): OFF (master-default), VRE
  (VETREENGAGE=1, veteran re-engagement lever ON), REC
  (VETREENGAGE=1, recorder OFF, D2 neutrality).
- `evidence/2026-11-16/sim-launchdef-a.md` + prereg — the
  launchdef corpora re-read in leg (a): BOTH legs re-land the
  vetparty seed call verbatim (wave-3+ fled fight seeds a
  plan WITH a target); control = seed ON + gate intact, armed
  = seed ON + gate bypass; tableseat-nowait policy, NOT
  competent. Its skip recorder watches wave-4+ holders ONLY.
- `evidence/2026-11-16/sim-gatelever-b.md` — the trick-wait
  blind spot: holds that land through vbrainAlignObjective
  rewriting the live objective to an indoor Haven chore never
  call vbrainExecuteDepart, so a depart-only recorder misses
  them. This arm's recorder reads the plan-commit layer (see
  Design decision 4), not only executeDepart.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md`
  (waves 3–5: the species a target can name),
  `docs/PARTY.md`, `docs/VILLAGER-BRAIN.md` (one-brain
  contract; vbrainAlignObjective). NO canon doc covers the
  part-2 commit lifecycle or the night-tick ordering — the
  commit/tick order is code behavior (`agencyTick` in
  `src/js/villager-agency.js`, `isNight()` = `dayPart === 3`
  in `src/js/game.js`), stated here as code fact, not canon.

## Code mechanism behind the question (read before building)

`src/js/win-plan.js`, verified by reading the file (not
inferred from counts):

- Plans are BORN targetless: `winPlanHavenTick` engagement
  seed and `winPlanSeedFromFight` both create the plan as
  `{ stage: 'gear', target: null, node: null, party: [], ... }`.
- A target attaches ONLY in `winPlanSeedFromFight` (`plan.target
  = mdef.id`), which fires after a `fieldFight` / `aidFight`
  vs a wave-3+ monster ending `vFlee` (the vetparty seed
  call, reverted on master; the live `winPlanSeedFromFight`
  itself is the same function). Stages advance gear → party
  → hunt → standing via `winPlanNoteKill` / Haven ticks.
- Consequence for the survey: on pure master, a plan gets a
  named beast only when its holder personally survives/flees
  a wave-3+ fight. The fresh-band leg tests whether that
  channel ever produces a target-carrying part-2 commit in
  150 days; the seed-enabled corpora in leg (a) show what
  the population looks like when the channel is forced open.

## Claims (sim-findings.md)

- `#2425` PART-2 COMMITS DIE AT THE NIGHT TICK — the
  targetless shape inside it is this arm's starting point.
  This arm does NOT close #2425: it measures the population
  the hold question needs. Any new finding this arm surfaces
  is REPORTED to the coordinator for the backlog (this arm
  appends nothing itself).

## Leg (a) — RE-READ (done before this commit, no new sims)

Method: the part2night commit definition applied verbatim to
the raw per-seed corpora (last part-2 score row per (vid, day)
carrying `winPlanAction === 'party_launch'`; target read from
that row's `plan.target`; wave from `src/data/monsters.json`).
Fates for target-carrying commits read from each corpus's own
depart rows (`dawnbidDeparts`, commitKind `mid-day part-2`)
and skip rows (`part2nightSkips` / `launchdefSkips`,
commitPart 2, part 3). "Unresolved" below means the corpus
carries NO depart/skip/part-3 row for that commit — the
launchdef skip recorder is wave-4+ filtered, so wave-3
target commits have no skip rows in that corpus. That gap is
exactly what this arm's any-wave recorder closes; it is a
corpus limitation, not a fate.

| Corpus (band, policy, game) | Part-2 commits | Target-carrying | Target share |
|---|---:|---:|---:|
| part2night-a (103411–103418, competent, pure master) | 6 | 0 | 0/6 |
| launchfunnel-a OFF (same band, competent, pure master) | 6 | 0 | 0/6 — identical commits, second recorder |
| launchfunnel-a VRE (same band, competent, VETREENGAGE=1) | 20 | 10 | 10/20 |
| launchfunnel-a REC (same band, VETREENGAGE=1, recorder OFF) | 0 | 0 | no score rows (recorder off by design) |
| launchdef-a control (102011–102018, tableseat-nowait, vetparty seed ON) | 59 | 17 | 17/59 |
| launchdef-a ON (same band/policy, seed ON + gate bypass) | 62 | 21 | 21/62 |

Leg (a) verdict: the 6/6 targetless count is CONFIRMED from
the raw part2night corpus files, and reproduced by the
independent OFF recorder (same 6 commits, same holders/days).
One superseded bid on the band carried a target (seed
103417, gen_zeekgsu, d40, `focus_group`, overwritten to
`party_wait`) — targets exist on the band, but no part-2
commit carried one. Target-carrying part-2 commits DO exist
in the wider corpora, but ONLY under seed-enabling (vetparty
seed call or VETREENGAGE=1): VRE 10/20 (spool ×4, eulogy ×3,
ad_break ×3, chorus_line ×1); launchdef control 17/59,
launchdef-on 21/62. On pure master the target share is 0/6
on two independent recorders.

Night-tick fates of target-carrying commits, where the corpus
can see them:

- VRE (10): 2 died at the night veto, both wave-4 eulogy
  (devon_okafor d98; sofia_chen d51); 1 held at depart
  (rafael_torres d41 spool, block hurt-no-medicine-no-healer);
  7 unresolved (all wave-3; no skip rows in this corpus).
- launchdef control (17): 7 died at the night veto, all
  wave-4 (eater ×4: gen_ntb585y d61/d66/d71, d90 unresolved;
  strike ×3: jorge_silva d68/d76/d80/d85 — four strike rows,
  three with night-veto skips); 1 depart-row `normal`
  (gen_ntb585y d76 eater, vidExped false); 9 unresolved (all
  wave-3: terms_of_service, redactor).
- launchdef-on (21): 8 died at the night veto (eater ×3,
  strike ×4, influencer ×1); 1 LAUNCHED (stan_kowalski d55
  redactor, wave 3, vidExped + companionExped true — the only
  target-carrying part-2 launch in any re-read corpus); 1
  depart-row `normal` (gen_ntb585y d76 eater); 11 unresolved
  (wave-3).
- No target-carrying commit in any corpus has a dawn
  follow-up snapshot, so target validity at dawn is
  unmeasured everywhere — the fresh-band instrument records
  it.

## Design decision 1 — the subject is the part-2 commit, verbatim part2night (frozen)

A part-2 commit is a (vid, day) pair whose LAST part-2 score
row carries a commit with `winPlanAction === 'party_launch'`
and `part === 2` (part2night prereg, Frozen definitions).
This arm reuses that definition EXACTLY so every count here
is directly comparable to part2night's 6/6. Target-carrying
means that last row's `plan.target` is non-null; the target
kind and wave come from `src/data/monsters.json` (wave of the
target id; `needWave` reported alongside). A superseded bid
(last part-2 row is another action) is counted separately,
with its target recorded — the launchdef/VRE re-read shows
superseded bids carry targets at a high rate (VRE 11/11
superseded groups target-carrying), so the superseded
population is part of the answer, not noise.

## Design decision 2 — legs (frozen, except leg (c) by addendum)

- (a) RE-READ — done (above). No new run.
- (b) FRESH BAND — seeds 103421–103428, 150d death-aware,
  competent verbatim policy, recorder ON, pure master. The
  judged leg. Freshness verified BEFORE this commit per the
  seed-band-freshness skill (see "Seed-band freshness").
- (c) LATER-HORIZON OR SECOND BAND — ONLY if (a)+(b) are
  targetless on pure master: EITHER re-run the fresh band at
  200d death-aware OR survey a second fresh band
  103431–103438 (freshness verified the same way) at 150d.
  The choice is made in a prereg ADDENDUM written AFTER (b)
  is analyzed and BEFORE (c) runs, justified by the (a)+(b)
  numbers. Do NOT run both blindly. The addendum may also
  record — but NOT run — the seed-enabled option the (a)
  numbers point at (re-landing the vetparty seed call on the
  fresh band to force the target population open); that is a
  follow-up arm's job, not this DIAG's, because it changes
  game code.
- Neutrality: the recorder is driver-side wraps only, zero
  `src/js` changes, zero default flips. The balanced panel
  (`scripts/balance-panel.js`) runs OFF vs recorder on the
  fresh band and the compare `.md` is attached — the
  recorder must not move outcomes. The panel compare is
  recorder-OFF vs recorder-ON on identical seeds (same
  instrument, same villages); a DIAG self-compare is
  degenerate by design and is NOT substituted for it.

## Design decision 3 — policy and band (frozen)

- Policy: **competent verbatim** (`scripts/policies/competent.js`,
  sha256
  `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
  — matches part2night's recorded sha). No env pairing.
- Band (b): **103421–103428** (8 seeds). Band (c), if a second
  band is chosen: **103431–103438** (8 seeds).
- Horizon (b): 150 days, death-aware (dead villages stop
  simulating). Horizon (c), if the longer horizon is chosen:
  200 days, death-aware.
- Base: master `0668af726` (contains the part2night +
  launchfunnel merges; the corpora re-read in leg (a) were
  produced on base `f9b33757a` — one merge behind; the
  re-read is a corpus fact, not a re-run, so the base
  difference does not touch it).

## Design decision 4 — the instruments (frozen)

The instrument is part2night's, adapted (renamed
`part2target`, same wraps, same commit definition). One
addition: target-presence is recorded on EVERY row that
carries a commit/plan, and the analyzer's primary table is
the target share.

### 4a. Layers the recorder reads (frozen — the trick-wait answer)

The recorder reads FOUR layers, and the prereg says which:

1. **Score layer** — `vbrainScorePick` wrap: every scoring
   call for a live plan holder (ANY wave) or any call carrying
   a win-plan candidate; row carries the resulting commit
   (`kind`, `winPlanAction`, `companion`, `part`) AND the
   holder's plan (`stage`, `target`, `needWave`, `party`) at
   scoring time. Target presence is a field on the row
   (`plan.target`, string or null — never undefined).
2. **Plan-commit layer** — `agencyTick` wrap
   (`installSkipRecorder`, part2night's, renamed): before each
   tick, for every live plan holder, read `vbrainCommit(vid)`
   + `state.village.winPlan[vid]`; if the holder holds
   today's `party_launch` commit and the tick does NOT call
   `vbrainExecuteDepart` with launch/hold, write a skip row
   with the reason (`night`, `indoor-objective`, `not-at-haven`,
   …) and the target. THIS is the layer that sees the
   trick-wait blind spot: a hold that lands through
   `vbrainAlignObjective` rewriting the live objective to an
   indoor Haven chore (`villager-brain.js`:
   `vbrainAlignObjective` — `party_wait` / `gear_hold` /
   `veteran_guard` commits, and `EXPEDITION` commits kept on
   an indoor chore hold) never calls `vbrainExecuteDepart`,
   so a depart-only recorder misses it — but the commit still
   says `party_launch` and the objective still reads indoor,
   so this layer records it as `indoor-objective` WITH the
   target attached. The proof test pins this (see below).
3. **Depart layer** — `vbrainExecuteDepart` wrap: every
   execute call carrying a win-plan action, with result
   (`launch`/`hold`/`normal`), expedition flags, launch
   blocks, and the plan target at execute time.
4. **Objective layer (dawn snapshot)** — at the first part-0
   tick of day D+1, pre-tick, snapshot every holder whose
   part-2 commit died at the night tick of day D: holder
   alive/at-Haven/away/engaged/sick/health/launch-block/
   medic-duty, danger gate, indoor-objective (from `objOf`
   + the EXPEDITION-commit exemption), plan still live,
   stage, **target now vs target at death** (same target?),
   party intact, per-companion state, and the fresh dawn
   commit. The analyzer joins these rows to the dawn depart
   rows (did the holder launch at dawn in reality, on any
   commit, and was the target the same?).

### 4b. Driver / analyzer / panel (adapted, not rebuilt)

- Driver: `scripts/part2target-driver-20261117.js` (new —
  part2night-driver adapted: same competent verbatim policy,
  single MODE `diag`, `PART2TARGET_RECORDER=off` skip-switch,
  same T-class instrument, same `v4seeds` / `v4departs` /
  `v4gates` / `v4encounters` + dawnbid capture rows for wall
  numbers and sense-testing, PLUS `part2targetSkips` (4a
  layer 2), `part2targetDawns` (4a layer 4), and the widened
  `dawnbidScores` (4a layer 1). The driver refuses to
  overwrite an existing per-seed file. Output:
  `evidence/2026-11-17/perseed-part2target-a/` (8 files per
  leg; leg (c) files go in `perseed-part2target-a-c/` if it
  runs).
- Analyzer: `scripts/analyze-part2target-a.js` (new —
  part2night's analyzer adapted: `classifyCommit`,
  `part2Commits`, `evaluateCounterfactual` reused VERBATIM
  so the 6/6 comparison is direct; new reporting sections
  are the target-share table, the target-fate table, and the
  dawn target-validity table). Output:
  `evidence/2026-11-17/part2target-a-analysis.json` (leg
  (b)); leg (c), if run, gets
  `part2target-a-c-analysis.json`.
- Panel: `scripts/build-part2target-panels-20261117.js`
  (new — part2night's panel builder adapted: builds the §15
  panel JSONs from the per-seed corpus and calls the
  scorecard's `comparePanels`). The frozen §15 panel is the
  OFF-vs-recorder compare on the fresh band (recorder OFF
  leg run with `PART2TARGET_RECORDER=off` on the same 8
  seeds, same policy): two pure-read recorders on the same
  villages must produce identical trajectories; any delta is
  a neutrality finding, reported, not hidden.
- Drift check: N/A single leg (no second leg to drift-check
  against). The neutrality proof is the D1/D2 pair below
  plus the OFF-vs-recorder panel compare.
- Proof: `scripts/test-part2target-a.js` (new; see below).
  GREEN before the judged leg runs.

## Frozen definitions

- **A part-2 commit** — part2night's, verbatim: a (vid, day)
  pair whose LAST part-2 score row carries a commit with
  `winPlanAction === 'party_launch'` and `part === 2`.
- **Target-carrying** — that last row's `plan.target` is a
  non-null monster id. **Targetless** — it is null.
  **Target wave** — the wave of the target id in
  `src/data/monsters.json`; `needWave` reported alongside.
  **Wave-4+ subset** — target wave ≥ 4 OR `needWave` ≥ 4.
- **Classification** of each part-2 commit — part2night's
  nine classes, same precedence: executed-launched,
  executed-held, died-at-night-veto, died-at-night-other,
  overwritten-before-night, plan-churned-before-night,
  holder-died-before-night, run-ended, UNCLASSIFIED.
- **Night-tick fate of a target-carrying commit** — its
  classification PLUS, for died-at-night-veto commits, the
  dawn follow-up: target still valid at dawn iff ALL of
  `targetNow === targetAtDeath`, `stageNow === stageAtDeath`,
  `partyIntact` hold at the part-0 snapshot of day D+1.
- **Counterfactual** (frozen; part2night's, with the target
  condition now biting): for each `died-at-night-veto`
  commit (day D), `would-have-launched` iff ALL dawn
  conditions pass at the part-0 snapshot of day D+1 — holder
  alive, at Haven, not away, not engaged, launch-block null,
  plan still live, still at `party` stage, **same target**,
  party list identical, each companion alive/at-Haven/not-away/
  launch-block null, no danger gate, not indoor-objective —
  AND the holder did NOT launch at dawn in reality. The
  "same target" condition is vacuous for targetless commits
  (recorded as such); for target-carrying commits it is a
  real condition and its failures are counted.
- **Wall numbers**: national / table / wins, wave-4/5
  unlocks, median survival — reported both ways (analyzer
  standing ≥ 200 AND panel scaleRank ≥ 2), as in part2night.
- **Starvation cost** (per `scripts/analyze-scale-costbar.js`
  B3): totals only — this DIAG has no armed leg, so no
  arm-only term exists.

## Primary metric + GO bar (frozen)

Primary metric: **share of part-2 commits carrying a named
target, by band/horizon** (analyzer target-share table), plus
the night-tick fates of target-carrying commits and how often
a target survives to a dawn launch.

GO iff ALL hold:

1. **Completeness:** every part-2 commit classified, 0
   `UNCLASSIFIED`; target presence recorded (target id or
   null, plus target kind/wave when present) on 100% of
   part-2 commits.
2. **Instrument valid:** 0 instrument errors, 8/8 files parse
   per surveyed band, every night skip row joins to a
   score-row part-2 commit (0 orphan skip rows), proof test
   green, D1 identical, D2 identical, OFF-vs-recorder panel
   compare shows identical trajectories.
3. **Counterfactual computed:** every `died-at-night-veto`
   commit that is target-carrying carries a dawn follow-up
   snapshot with target-validity fields, or a recorded
   `no-next-dawn` reason (run ended) — 0 missing.
4. **Subject formed (viability floor):** at least 1 part-2
   commit observed across the surveyed bands. If the floor
   fails, the verdict is UNJUDGEABLE (subject absent), not a
   zero GO.

A DIAG has no NO-GO: EITHER a target-carrying population is
found with its night-tick fates classified, OR a measured
zero is reported with the full search space documented
(bands + horizons surveyed, commit counts per band). The bars
above are the judge; the balanced panel is the instrument,
not the judge.

## Secondary (reported, not judged)

- Full classification per leg (all 9 classes), per-seed
  table: part-2 commits, target-carrying, executed
  (launched/held), died-at-night (veto/other), overwritten,
  churned, died, run-ended.
- Target-share table by band/horizon, by stage
  (gear/party/standing/hunt), by wave (3/4/5), and by
  superseded-vs-commit.
- Dawn target-validity table for target-carrying
  died-at-night-veto commits: target same? stage same?
  party intact? would-have-launched (with the same-target
  condition biting)?
- Holder-state table at each night death (target-carrying
  subset alongside the any-wave table).
- Wall numbers (both national definitions): national /
  table / wins, wave-4/5 unlocks, median survival.
- Death-cause shares; starvation per-seed; scholar deaths.
- Sense check: quote the depart / fight lines (`log[]`) for
  any target-carrying part-2 launch, else for the dawn
  launches nearest each target-carrying night death — and
  judge whether the parties read like parties going
  somewhere real (a named beast, companions present, a
  fight that reads like a fight). Name the lines' source
  (seed, day, fighter, monster) and the counts searched. Do
  not invent fight narrative from kill counts.
- Part-3 commits counted as a secondary total if visible in
  score rows.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** same tip, seed 103421, 60d, recorder
  ON, run twice → identical per-seed JSON (deaths/days/endReason
  + all part2target rows identical).
- **D2 (wrap neutrality):** same tip, seed 103421, 60d, recorder
  ON vs recorder OFF (`PART2TARGET_RECORDER=off`) → identical
  trajectories (deaths/days/endReason/standing + daily
  fingerprints). The recorder is driver-side wraps only; OFF
  must produce byte-identical trajectories.
- **D3: N/A single leg.** There is no second leg to drift-check
  against; the D1/D2 pair + the OFF-vs-recorder panel compare
  is the neutrality proof. (No `src/` change exists in this
  arm, so there is no tip difference for a drift check to
  catch.)

## Proof test

`scripts/test-part2target-a.js` proves, on synthetic fixtures
and live in-memory runs (no corpus numbers):

- Static: `git diff HEAD -- src/` is empty (the arm touches no
  game code — driver/analyzer/panel-builder/test/evidence only);
  `src/js/win-plan.js` byte-identical to HEAD (Loop B works
  that file); the driver/analyzer/panel-builder file list is
  exactly the four new names; the wave-4 id set matches
  `src/data/monsters.json` wave 4 exactly (10 ids).
- Unit (classifier, synthetic fixtures — reuses the analyzer's
  `classifyCommit`): one fixture per classification class (9)
  with the frozen precedence; a target-carrying fixture per
  class where the class can carry one; orphan skip row flagged,
  not classified; counterfactual fixtures — all dawn conditions
  pass + same target + no real dawn launch →
  would-have-launched; each single dawn failure (holder away,
  plan churned, companion gone, launched-anyway, holder sick,
  **target changed at dawn**, **target gone at dawn**) → not;
  no-next-dawn → recorded, not missing.
- Target-share unit: synthetic corpora where the analyzer's
  target-share table sums to the commit count, split
  target-carrying vs targetless, by wave and by stage; a
  superseded bid with a target is counted in the superseded
  table, never in the commit table.
- Recorder: synthetic fixtures for the skip-row shape (all
  reasons + holder-state fields incl. medic-duty and companion
  state + **target on every row, string or null**); a live
  in-memory run proves the `agencyTick` wrap records a night
  skip row with reason `night` for a committed holder who is
  otherwise launchable at part 3, with the target recorded;
  a live in-memory run proves an **indoor-objective hold**
  produces a skip row with reason `indoor-objective` and the
  target recorded (the trick-wait blind-spot leg: the
  commit layer sees what a depart-only recorder misses); a
  live in-memory run proves the dawn follow-up snapshot fires
  at the next part-0 tick with the holder/plan/companion
  fields AND `targetNow` vs `targetAtDeath`; a live
  in-memory run proves the `vbrainScorePick` wrap records a
  part-2 `party_launch` commit WITH its plan target.
- Determinism: D1 + D2 as frozen above (seed 103421, 60d).
- GREEN before the judged leg runs.

## Seed-band freshness (verified BEFORE this commit, per the seed-band-freshness skill)

- Scope: boundary-aware grep (`(^|[^0-9])10342[1-8]([^0-9]|$)`
  and `(^|[^0-9])10343[1-8]([^0-9]|$)`) over ALL
  `evidence/*/sim-*-prereg.md` (964 files, zero hits for
  either band); `scripts/*.js` (zero hits); evidence
  filenames under `evidence/2026-11-1*/` (zero hits); goal
  `hidden_files/*.md` (zero hits). No forbidden-band or
  contaminated-band list file exists under the goal's
  `hidden_files/` (directory listing checked; only
  seed-named run logs, none in 10342x/10343x). A full-tree
  unbounded grep was NOT used: an early unbounded attempt
  matched inside multi-MB JSON corpora (calorie counts and
  float digits containing the digit runs) and was killed —
  the boundary-aware searches above are the check.
- Result: **103421–103428 FRESH, 103431–103438 FRESH.**
  Neighbouring used bands: 103411–103418 (part2night /
  launchfunnel, 2026-11-17), 103101–103108 (nightcarry),
  102011–102018 (launchdef). Loop B's live claim
  (`fleshout-loop-b-20261117T1521Z.json`: nondeathplan-live-b
  + partysize-b) names no band in this arm's brief — its
  band is unknowable from the claim; this arm does not touch
  Loop B's work.
- The coordinator already checked preregs + filenames and
  found no hits; this arm re-verified itself before running,
  as the task requires.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 3 "The Final Draft", wave 4
  "The Mirror Draft", wave 5 "The Producers" (the species a
  target can name; readiness bars — the bars this chain feeds,
  not changes).
- `docs/PARTY.md` — the party concept this chain test-cases.
- `docs/VILLAGER-BRAIN.md` — the one-brain contract: Phase 1
  (dawn scorer; drive candidates as scorer candidates), §9
  (win prices / deed gates / readiness bars untouched;
  perception law); `vbrainAlignObjective` (the indoor-chore
  rewrite behind the trick-wait blind spot).
- `src/js/win-plan.js` — code facts only (plans born
  targetless; target attaches in `winPlanSeedFromFight`):
  no canon doc covers the part-2 commit lifecycle.
- Prior evidence: `evidence/2026-11-17/sim-part2night-a.md`
  (§"The targetless shape", §"Metric review" — the prereg
  miss this arm answers) and `evidence/2026-11-16/sim-launchdef-a.md`
  (§"The lever, in plain words" — the seed call that opens
  the target population).

## Metric review (to be filled in the evidence file)

Pre-registered here: the GO bar's completeness threshold (0
UNCLASSIFIED) is set against part2night's 0 on a 6-commit
population — the fresh band's population may be thinner
(0–6 commits expected on pure master), so the viability floor
(≥1 part-2 commit) may fail and the verdict would be
UNJUDGEABLE, not a zero GO; that outcome is recorded as
such, with leg (c) as the follow-up. If the classifier needs
a 10th class mid-run, that is a prereg miss to record here,
not a silent re-score — the run judges against THESE nine
classes, and any new class is reported under "metric review"
with the counts it would have taken. The target-share metric
binds the run: a 0/x target share on pure master is a GO
measurement (if the instrument bars pass), never re-scored
against the seed-enabled corpora's share.
