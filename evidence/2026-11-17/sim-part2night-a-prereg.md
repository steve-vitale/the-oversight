# sim-part2night-a — PREREG (binding)

Run: fleshout-20261117T1215Z (Loop A), axis scale-onramp, arm
sim-part2night-a — DIAG, instrument-only: quantify part-2
`party_launch` commits dying at the night tick, with a
hold-to-next-dawn counterfactual. Branch `sim-part2night-a`
(worktree `~/workspace/worktrees/sim-part2night-a`). Base master
`f9b33757a` at arm start. Binding prereg: THIS file — frozen
before any judged sim. The instrument (driver, analyzer, panel
builder, proof test) is built AFTER this commit; no judged
numbers exist yet.

## The question, in plain words

A villager commits mid-day (part 2) to lead a party out after a
beast. The next tick is night (part 3), and the night veto stops
the departure before it starts — so the commit dies overnight,
silently, and the next dawn's refresh writes a fresh lottery pick
over it. The launchdef pilot counted 25 such night deaths (all at
tick part 3) and zero part-2 launches. This DIAG measures the
loss: how many part-2 commits die at the night tick, how many of
those were actually killed BY the night veto (the holder was
otherwise ready to go), and how many would have launched at the
next dawn if the commit had been held overnight. The design
question — hold a part-2 commit to the next dawn, or is part-1
the only real mid-day channel? — is Steve's; this arm supplies
the numbers for it, and changes nothing in the game.

## Prior art (read first)

- `evidence/2026-11-16/sim-launchdef-a.md` + prereg — the finding
  this arm quantifies: all 25 night skip rows (17 armed, 8
  control) at tick part 3; all 5 mid-day launches part-1; the
  skip-reason recorder (reused here, widened — see Decision 4).
  Finding #2425 in `sim-findings.md`, claimed by this arm.
- `evidence/2026-11-17/sim-nightcarry-a.md` +
  `sim-nightcarry-resume.md` + preregs — the night-carry lever is
  a DIFFERENT mechanism (it carries a commit across one night;
  this DIAG does not rebuild it, and does not touch
  `src/js/villager-brain.js`). Its resume verdict is UNJUDGEABLE:
  on that tip no wave-4+ plan instance ever opens (plans are
  wave-3-born, wave-4 met mid-hunt), and its skip recorder — which
  watches only wave-4+ holders — recorded 0 skips while 4 commits
  demonstrably died overnight on wave-3 plans. Its metric review
  names the exact widening this arm performs: the skip recorder
  must watch ANY-wave plan holders. Where the questions differ:
  nightcarry asked whether a carry lever converts died-overnight
  commits into launches (a lever, judged on wave-4+ instances);
  this arm asks how many part-2 commits the night veto kills and
  how many would have launched at next dawn if held (a
  measurement, on any-wave commits, no lever, no wave-4+ subject).
- `evidence/2026-11-16/sim-gatelever-b.md` — context: the gate
  says SEEK almost never even for parties of three (trick unknown
  on every null row); kills happen in ordinary encounters the gate
  never blesses. The launch funnel is thin at every stage, and the
  night veto is one more stage.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md` (wave 4
  "The Mirror Draft"; wave 5 "The Producers"; readiness bars —
  the bars this chain feeds, not changes), `docs/PARTY.md`,
  `docs/VILLAGER-BRAIN.md` (one-brain contract: Phase 1 dawn
  scorer; §9 win prices / deed gates / readiness bars untouched;
  perception law). NO canon doc covers the part-2 commit
  lifecycle or the night-tick ordering — the commit/tick order is
  code behavior (`agencyTick` in `src/js/villager-agency.js`,
  `isNight()` = `dayPart === 3` in `src/js/game.js`), stated
  here as code fact, not canon.

## Claims (sim-findings.md)

- `#2425` PART-2 COMMITS DIE AT THE NIGHT TICK — claimed by this
  arm at prereg time. The DIAG quantifies the loss; the design
  question (hold to dawn vs part-1 only) stays Steve's. The entry
  is updated with the quantification + evidence link at the end;
  it is NOT closed as `[fixed]` by a DIAG that changes nothing —
  the observation is measured, the call remains open.

## Design decision 1 — the subject is ANY-wave part-2 commits (frozen)

The mechanism is wave-agnostic in code: a part-2 commit's next
tick is night whatever the plan's wave, and `isNight()` vetoes
before `vbrainExecuteDepart` is ever called. Restricting to
wave-4+ holders would reproduce nightcarry-resume's vacuity (0
instances on the 103101–103108 band; the skip recorder blind
while commits died on wave-3 plans). The subject is therefore
every live plan holder's part-2 `party_launch` commit, any wave.
The wave-4+ subset is reported alongside (same classification)
so the numbers stay comparable to launchdef-a. No vetparty seed
call is re-landed: the subject forms naturally (wave-3 plans
launch regularly — 21 launch rows on one nightcarry-resume
control seed), and this arm measures pure master, not a
seed-enabled population.

## Design decision 2 — single leg, DIAG, instrument-only (frozen)

ONE leg on current master: competent verbatim policy, recorder
ON, seeds 103411–103418, 150d death-aware. There is no armed leg
— nothing is being changed, so there is nothing to contrast.
The corpus IS the control substrate shared by design with sibling
arm sim-launchfunnel-a (same 8 villages, same policy, same band).
No `src/` file is touched by this arm — the recorder lives
entirely in the driver (pure-read wraps + driver-local arrays),
and `src/js/win-plan.js` is never modified (Loop B's live arm
works that file). If anything proves unobservable without a
win-plan.js hook, it is recorded as an instrument limitation,
not worked around by touching the file.

## Design decision 3 — policy and band (frozen)

- Policy: **competent verbatim** (`scripts/policies/competent.js`,
  sha256
  `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
  — matches the nightcarry-resume recorded sha). No env pairing.
- Band: **103411–103418** (8 seeds), shared by design with
  sim-launchfunnel-a. Freshness verified 2026-11-17 by this arm
  BEFORE this commit, per the seed-band-freshness skill:
  boundary-aware grep (`(^|[^0-9])10341[1-8]([^0-9]|$)`) over all
  `evidence/*/sim-*-prereg.md` (zero hits) and `scripts/*.js`
  (zero hits); the un-bounded full-tree grep's 10 hits are ALL
  false positives — calorie counts (`pantryFreshAfter 103412`,
  `rotFreshKcal 103411`, `"ate": 1034145`) and float digits
  (`6143.2969121103415`, `44.05777210341526`) — none is a sim
  seed; evidence filenames contain no 103411–103418 seed. Loop B's
  live claim (`fleshout-loop-b-20261117T1130Z.json`) names NO band
  — its band is unknowable from the claim, recorded here as such.
  Loop A's own claim (`fleshout-20261117T1215Z.json`) names this
  band as this run's shared band by design — that is this run's
  assignment, not a prior use. Neighbouring used bands: 103101–
  103108 (nightcarry, partially spent), 102011–102018
  (launchdef), 102101–102108 (gatelever-b).
- Horizon: 150 days, death-aware (dead villages stop simulating).

## Design decision 4 — the instruments (frozen)

### 4a. Part-2 commit census (NEW)

The driver wraps `Game.vbrainScorePick` (the dawn/mid-day scorer)
and records, per scoring call for a live plan holder (ANY wave)
or any call carrying a win-plan candidate: the resulting commit
(`kind`, `winPlanAction`, `companion`, `part`), the holder's plan
(stage/target/party) and gear at scoring time. A part-2 commit is
a score row whose commit has `winPlanAction === 'party_launch'`
and `part === 2`. The standing commit per (vid, day, part) is the
LAST score row in that part — a later score call in the same part
that picks something else overwrites it (recorded, not hidden).
The wrap fires for plan holders even when the new score carries
NO win-plan candidate, so an overwrite of a part-2 commit by a
later (part-2 or part-3) re-score is visible in the rows.

### 4b. Any-wave skip-reason recorder (launchdef's, widened)

The driver wraps `Game.agencyTick` (+ chains onto
`vbrainExecuteDepart`), reusing launchdef-a's
`installSkipRecorder` with exactly two changes: (1) the wave-4+
filter is REMOVED — every live plan holder holding today's
`party_launch` commit is snapshotted, any wave; (2) the snapshot
gains holder-state fields for the state table: sick, health,
launch-block (`deriveLaunchBlock` replica: sick / range-0 /
hurt<70-no-medicine-no-healer), medic-duty holder
(`medicDutyHolder() === vid`), and per-companion state (each
party member: at Haven, away/exped, launch-block, alive).
Reason precedence is launchdef's, minus the retired
profile-gate-veto (the bypass is live in game code on this tip,
so a `party_launch` commit never vetoes there; the reason stays
in the known list with expected count 0): holder-dead, engaged,
away-as-companion, away-on-expedition, not-at-haven, night,
indoor-objective, danger-gate, execute-returned-normal, other.
NEW: the `other` fix launchdef named — after the tick, a row
whose reason would be `other` re-reads expedition status; if the
holder departed as a companion DURING the tick (exped standing
now, absent pre-tick), the reason is
`away-as-companion-this-tick`, not `other`.

### 4c. Dawn follow-up snapshot (NEW — the counterfactual's data)

At the first part-0 (`agencyTick`) of day D+1, pre-tick, the
driver snapshots every holder whose part-2 commit died at the
night tick of day D (any skip reason, so the 'night' subset and
the would-have-failed-anyway subset both carry dawn state):
holder alive, at Haven, away/exped, engaged, sick, health,
launch-block, medic-duty, danger gate, indoor-objective; plan
still live, stage, target (same as at death?), party list
(identical = intact); per-companion Haven/away/launch-block;
the fresh dawn commit (what the lottery actually picked). The
analyzer joins these rows to the dawn depart rows (did the
holder launch at dawn in reality, on any commit?).

### 4d. Driver / analyzer / panel (adapted, not rebuilt)

- Driver: `scripts/part2night-driver-20261117.js` (new — the
  nightcarry driver adapted: competent verbatim policy, single
  MODE `diag`, `PART2NIGHT_RECORDER=off` skip-switch, same
  vetfirst T-class instrument, same `v4seeds` / `v4departs` /
  `v4gates` / `v4encounters` + dawnbid capture rows for wall
  numbers and sense-testing, PLUS `part2nightSkips` (4b),
  `part2nightDawns` (4c), and the widened `dawnbidScores` (4a)).
  The driver refuses to overwrite an existing per-seed file.
  Output: `evidence/2026-11-17/perseed-part2night-a/` (8 files).
- Analyzer: `scripts/analyze-part2night-a.js` (new — NOT a copy
  of the launchdef analyzer: the unit is the COMMIT, not the
  plan instance). Output:
  `evidence/2026-11-17/part2night-a-analysis.json`.
- Panel: `scripts/build-part2night-panels-20261117.js` (new —
  the nightcarry panel builder adapted: builds the §15 panel
  JSONs from the per-seed corpus and calls the scorecard's
  `comparePanels`). Single-leg DIAG, so the compare is a
  SELF-compare (before = after = this corpus): degenerate BY
  DESIGN, expected decision `no_material_signal` with all
  deltas 0 — it verifies the corpus rows parse through the
  scorecard and states that no contrast exists for a DIAG.
  If the sibling sim-launchfunnel-a corpus (same band/seeds/
  policy) is present at panel time, the builder ALSO runs the
  cross-instrument compare (this corpus vs the sibling's) as a
  secondary check — two pure-read recorders on the same villages
  must produce identical trajectories; any delta is a neutrality
  finding, reported, not hidden. The self-compare is the frozen
  §15 panel; the cross-compare is optional and never substitutes
  for it.
- Drift check: N/A single leg (no second leg to drift-check
  against). The neutrality proof is the D1/D2 pair below.
- Proof: `scripts/test-part2night-a.js` (new; see below).
  GREEN before the judged leg runs.

## Frozen definitions

- **A part-2 commit** is a (vid, day) pair whose LAST part-2
  score row carries a commit with `winPlanAction ===
  'party_launch'` and `part === 2`. (If a later part-2 score row
  for the same vid overwrites it with another action, it is not
  a part-2 commit — it is a superseded bid, counted separately.)
- **Classification** of each part-2 commit, in precedence order:
  1. `executed-launched` — a dawnbidDeparts row (same vid, day,
     commitKind `mid-day part-2`) with result `launch` and both
     expeditions started.
  2. `executed-held` — a depart row as above with result `hold`
     (the execute path was reached; a launch blocker held it).
  3. `died-at-night-veto` — a `part2nightSkips` row at part 3
     with reason `night` (holder otherwise launchable at the
     night tick: dead/engaged/away/not-at-haven all false).
  4. `died-at-night-other` — a part-3 skip row with any other
     reason (away, not-at-haven, …): died at the night tick but
     would have failed anyway.
  5. `overwritten-before-night` — a later score row (part 2
     after the commit, or part 3) for the same vid whose commit
     is not the part-2 `party_launch` — the scorer replaced the
     launch before any tick could execute it.
  6. `plan-churned-before-night` — no skip/depart/overwrite row,
     and the plan is absent from the end-of-day census for that
     day (the plan died with the day, not the commit).
  7. `holder-died-before-night` — no skip/depart/overwrite row,
     and a deaths row names the holder that day.
  8. `run-ended` — no skip/depart/overwrite row, and the run's
     `gameDays` equals the commit day (the village ended before
     the night tick).
  9. `UNCLASSIFIED` — none of the above. Expected 0; any count
     is an instrument gap, reported, not hidden.
- **Counterfactual** (frozen; see "Counterfactual" below): for
  each `died-at-night-veto` commit (day D), `would-have-launched`
  iff ALL dawn conditions pass at the part-0 snapshot of day D+1
  AND the holder launched at no dawn depart row that day.
- **Wave-4+ subset**: the same classification restricted to
  commits whose plan target is a wave-4+ monster id (data) or
  `needWave >= 4` — reported alongside the any-wave numbers.
- **Wall numbers**: national / table / wins, wave-4/5 unlocks,
  median survival — reported both ways (analyzer standing ≥ 200
  AND panel scaleRank ≥ 2), as in launchdef-a.
- **Starvation cost** (per `scripts/analyze-scale-costbar.js`
  B3): totals only — this DIAG has no armed leg, so no arm-only
  term exists; the number is context for the wall, not a bar.

## Primary metric + GO bar (frozen)

Primary metric: **part-2 commits per band — count, and how many
die at the night tick vs execute** (analyzer classification
above), plus the counterfactual **launches lost to the night
veto** (would-have-launched count among `died-at-night-veto`
commits).

GO iff ALL hold:

1. **Completeness:** every part-2 commit classified, 0
   `UNCLASSIFIED`.
2. **Instrument valid:** 0 instrument errors, 8/8 files parse,
   every night skip row joins to a score-row part-2 commit (0
   orphan skip rows), proof test green, D1 identical, D2
   identical.
3. **Counterfactual computed:** every `died-at-night-veto`
   commit carries a dawn follow-up snapshot, or a recorded
   `no-next-dawn` reason (run ended) — 0 missing.
4. **Subject formed (viability floor):** at least 1 part-2 commit
   AND at least 1 `died-at-night-veto` commit observed. If the
   floor fails, the verdict is UNJUDGEABLE (subject absent —
   the nightcarry-resume shape), not a zero-loss GO.

A DIAG has no NO-GO: a zero-loss result (all part-2 commits
execute, or fail for other reasons, or the counterfactual is 0)
is still a GO quantification — the answer is "the night veto
costs ~0 launches", reported as such. The bars above are the
judge; the balanced panel is the instrument, not the judge.

## The counterfactual (frozen — assumptions stated plainly)

For each `died-at-night-veto` commit (day D): IF the commit had
survived the night — the ONLY change being that the dawn
`objTick` refresh does not overwrite it — would it have launched
at the first dawn `agencyTick` of day D+1? Counted as
`would-have-launched` iff ALL of the following hold at the
pre-tick dawn snapshot (day D+1, part 0):

- holder alive; holder at Haven; holder not away (no expedition
  standing, not `away`); holder not engaged;
- holder launch-block null (not sick, not range-0, not
  hurt<70 without medicine or a healer at camp);
- plan still live, still at `party` stage, same target;
- party list identical to the night-death row (intact);
- each companion alive, at Haven, not away, launch-block null;
- no danger gate; not indoor-objective;
- AND the holder did NOT launch at dawn in reality (no dawn
  depart row for that vid on day D+1 — a real dawn launch on a
  fresh commit means the night death cost nothing).

Assumptions, stated plainly:

(a) The held commit would be the commit the dawn tick executes
    — the refresh is the only writer, so holding it is the only
    change vs reality.
(b) The observable conditions are NECESSARY, not sufficient: the
    execute path (`vbrainExecuteDepart`, `win-plan.js`
    internals) could still hold for reasons the recorder cannot
    see — so the count is an UPPER BOUND on launches the hold
    would have produced, not a guarantee. (No win-plan.js hook
    exists for this; per the task, that is recorded here as an
    instrument limitation, and the file is not touched.)
(c) The dawn state is read pre-tick, post-refresh — the state
    the held commit would have faced.
(d) Medic-duty is NOT a dawn launch blocker: directed win-plan
    launches are exempt from the duty block (code:
    `src/js/villager-agency.js` `startExpedition` — "DIRECTED
    win-plan launches (opts.tx set) are exempt"; `vbrainExecuteDepart`
    in `src/js/villager-brain.js` calls `startExpedition` with
    `opts = { tx, ty, duration }`). Medic-duty is recorded as
    holder STATE at night death and at dawn, not counted as a
    blocker. If the corpus contradicts (d) — a would-have-launched
    holder who is the duty holder failing to launch at dawn on a
    fresh commit — the analyzer flags it; it does not silently
    re-score.
(e) A same-day part-1 re-bid launch is NOT counted as recovery
    in the frozen counterfactual (dawn window only). It is
    reported as secondary context: how many night-killed holders
    launched later that same day anyway.

## Secondary (reported, not judged)

- Full classification per leg (all 9 classes), per-seed table:
  part-2 commits, executed (launched/held), died-at-night
  (veto/other), overwritten, churned, died, run-ended.
- Wave-4+ subset of the same table (launchdef comparability).
- Holder-state table at each night death: at Haven? away?
  medic-duty? sick? engaged? profile? plan stage? target wave?
  party size? — with counts, not just anecdotes.
- Dawn-condition failure table: for `died-at-night-veto`
  commits, which dawn condition fails most often (holder away at
  dawn? plan churned? companion gone? launched anyway?).
- Wall numbers (both legs — there is one leg; both national
  definitions): national / table / wins, wave-4/5 unlocks,
  median survival.
- Death-cause shares; starvation per-seed; scholar deaths.
- Sense check: quote the depart / fight lines (`log[]`) for
  executed part-2 launches if any, else for the dawn launches
  nearest each night death — and judge whether the parties read
  like parties going somewhere real. Name the lines' source
  (seed, day, fighter, monster) and the counts searched. Do not
  invent fight narrative from kill counts.
- Part-3 commits (written after the day's last tick) counted as
  a secondary total if visible in score rows — out of scope for
  classification, recorded so the next instrument knows the size
  of the neighbouring population.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** same tip, seed 103411, 60d, recorder
  ON, run twice → identical per-seed JSON (deaths/days/endReason
  + all part2night rows identical).
- **D2 (wrap neutrality):** same tip, seed 103411, 60d, recorder
  ON vs recorder OFF (`PART2NIGHT_RECORDER=off`) → identical
  trajectories (deaths/days/endReason/standing + daily
  fingerprints). The recorder is driver-side wraps only; OFF
  must produce byte-identical trajectories.
- **D3: N/A single leg.** There is no second leg to drift-check
  against; the D1/D2 pair is the neutrality proof. (No
  `src/` change exists in this arm, so there is no tip
  difference for a drift check to catch.)

## Proof test

`scripts/test-part2night-a.js` proves, on synthetic fixtures
and live in-memory runs (no corpus numbers):

- Static: `git diff HEAD -- src/` is empty (the arm touches no
  game code — driver/analyzer/panel-builder/test/evidence only);
  the driver/analyzer/panel-builder file list is exactly the four
  new names; the wave-4 id set matches `src/data/monsters.json`
  wave 4 exactly (10 ids); `src/js/win-plan.js` untouched.
- Unit (classifier, synthetic fixtures — reuses the analyzer's
  `classifyCommit`): one fixture per classification class
  (executed-launched, executed-held, died-at-night-veto,
  died-at-night-other, overwritten-before-night,
  plan-churned-before-night, holder-died-before-night,
  run-ended, UNCLASSIFIED); precedence (depart beats skip;
  skip beats overwrite); orphan skip row (no score-row commit)
  flagged, not classified; counterfactual fixtures — all dawn
  conditions pass + no real dawn launch → would-have-launched;
  each single dawn failure (holder away, plan churned, companion
  gone, launched-anyway, holder sick) → not; no-next-dawn →
  recorded, not missing.
- Recorder: synthetic fixtures for the skip-row shape (all
  reasons + holder-state fields incl. medic-duty and companion
  state); a live in-memory run proves the `agencyTick` wrap
  records a night skip row with reason `night` for a committed
  holder who is otherwise launchable at part 3, AND proves the
  same-tick companion re-read reclassifies `other` →
  `away-as-companion-this-tick`; a live in-memory run proves the
  dawn follow-up snapshot fires at the next part-0 tick with the
  holder/plan/companion fields; a live in-memory run proves the
  `vbrainScorePick` wrap records a part-2 `party_launch` commit.
- Determinism: D1 + D2 as frozen above (seed 103411, 60d).
- GREEN before the judged leg runs.

## Sense-testing

Quote the depart / fight lines the recorder captures for
executed part-2 launches if any exist, else for the dawn launches
nearest each night death, and judge whether the parties read like
parties going somewhere real — a named target, companions
present, a fight that reads like a fight. Name the lines' source
(seed, day, fighter, monster) and the counts searched. Do not
invent fight narrative from kill counts.

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
- Prior evidence: `evidence/2026-11-16/sim-launchdef-a.md`
  (§"The skip-reason decomposition" — this arm's subject) and
  `evidence/2026-11-17/sim-nightcarry-resume.md` (§"Metric
  review" — the any-wave widening this arm performs;
  §"Why zero instances open" — the vacuity this arm avoids by
  design).

## Metric review (to be filled in the evidence file)

Pre-registered here: the GO bar's completeness threshold (0
UNCLASSIFIED) is set against launchdef-a's 0-bare-days result on
a wave-4+ population — the any-wave population is larger and no
longer seed-enabled, so the overwrite/churn classes may be
bigger than launchdef's; if the classifier needs a 10th class
mid-run, that is a prereg miss to record here, not a silent
re-score — the run judges against THESE nine classes, and any
new class is reported under "metric review" with the counts it
would have taken. The viability floor (≥1 part-2 commit AND ≥1
night-veto death) is set against launchdef's 25 night rows on a
seed-enabled band and nightcarry's 47 skips on one old-base seed;
on pure master + competent the any-wave population is expected
non-vacuous, but if the floor fails the verdict is UNJUDGEABLE,
not a zero-loss GO.
