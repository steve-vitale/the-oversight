# sim-nondeathplan-live-b — PREREG (binding)

Run: fleshout-loop-b-20261117T1521Z (Loop B), axis winnability chain,
arm sim-nondeathplan-live-b — ADOPTION of a stranded arm that never
started (1409Z closeout: arm 2 brief
`hidden_files/arm2-nondeathplan-live-brief-20261117T1409Z.md`).
Branch `sim-nondeathplan-live-b` (worktree
`~/workspace/worktrees/sim-nondeathplan-live-b`). Base at arm start:
local master `0668af726` (coordinator closeout commit; the landed
fix `446a96ef4` verified present with `git merge-base
--is-ancestor 446a96ef4 HEAD` before any work). Binding prereg:
THIS file — frozen before any judged sim. Commit this file FIRST,
then build the proof test + classifier fix, then run the judged
staged fixtures. No judged numbers exist yet.

AMENDMENT (coordinator follow-up, folded in BEFORE this freeze):
the frozen GO bars are the follow-up's five bars (§GO bars below),
not looser ones; the verdict must name per how whether it was
observed through a real trigger vs a direct call; finding #2482
(deadplan slot-count classifier) is in scope with its own bar;
the test-nondeathplan-b.js baseline on merged master is 63/64
(branch-diff static-check artifact, not a regression — see §Prior
art). No re-scoring against looser bars after this freeze.

## The question, in plain words

A villager starts a win-plan (gear up, gather a party, walk out and
hunt the beasts the village needs dead). The villager LEAVES the
village alive — driven off, walked out, exiled, paid away, or named
for the relay. The landed fix (`winPlanOnVillagerLeave`, commit
`446a96ef4`) says the plan dies with their leaving, but it is
proven only in unit fixtures: on bands 103241–103248 and
103231–103238 ZERO non-death removals occurred under the competent
policy, so the hook never fired live. Does it fire in a real
running game when a villager actually leaves — and does the
leaver's plan die with them, with no ghost left in anyone's party?

## Prior art (read first)

- `evidence/2026-11-17/sim-nondeathplan-b.md` + prereg — the fix,
  its removal-path inventory, its proof (64/64 on its branch tip),
  and its measured NO-GO (bars 1+2a: zero non-death removals on
  the band). Finding #2481 (non-death removals never fire under
  the competent policy) and finding #2475's "needs a live
  observation" (the file's #2476 line, "NON-DEATH REMOVALS LEAVE
  PLANS LINGERING" — see §Findings note) are what this arm closes.
- `evidence/2026-11-17/sim-winnability-round-1409.md` — closeout:
  the fix landed; proof re-run on merged master is **63/64**, the
  single failure being the branch-relative static check (empty
  branch diff post-merge) — an instrument artifact, NOT a
  regression. Expect that if `scripts/test-nondeathplan-b.js` is
  re-run as a baseline on this tip; do not chase it as breakage.
  This arm's own proof test must be green on its branch tip.
- `docs/CANON.md` (read first). CANON GAP (recorded, not invented):
  no CANON-registered doc covers winPlan lifecycle or removal
  cleanup (checked 2026-11-17 against the manifest, same as
  deadplan/deathcleanup/nondeathplan). The work is grounded only
  in `src/js/win-plan.js`, `src/js/betrayal.js`,
  `src/js/party.js`, `src/js/game.js`, `src/js/table.js`,
  `src/js/table-defiant.js`, `src/js/ladder.js`, and that evidence.
- `docs/MEASUREMENT.md` §§9–12, 14–15. No balanced panel: this is
  a fixture/proof arm on an already-landed fix, not a lever
  comparison (per the brief).

## Staging design (frozen — probe-verified, NOT judged)

Each how is staged in a FRESH live game (node harness, seeded,
`loadGame` + `setupGame`, full src eval in index.html order).
Holder + companion each hold a `hunt`-stage winPlan naming the
other (`Game.winPlanOf(vid)` + stage/party — the same fixture
setup as `test-nondeathplan-b.js`); the removal is then driven
through its REAL game trigger (below), and the live loop runs 10
competent days afterwards (`runDays`, competent verbatim) so the
7-day lingering rule is observed in a running game, not asserted
at the removal instant. Say lines are captured per case
(`Game.say` wrapped in the proof process only) for sense-testing.
All six stagings were verified runnable in /tmp scratch probes on
2026-11-17 (probe scripts NOT committed — the judged runs in
`scripts/test-nondeathplan-live-b.js` are the record); the probe
results are stated here so the frozen design is checkable, but the
JUDGED numbers come only from the proof test runs after this
commit.

- **fled** — REAL TRIGGER `Game.intimidate(vid)` (game.js:4340,
  break-point at game.js:4406). Seed 103241, withdrawn
  `owen_smith`, `npcNeeds.fear = 100` (the staged precondition:
  a terrified villager at the breaking point — the trigger reads
  `recentThreats >= 2 || fear >= 95`, then a 50% run/snap roll).
  Probe: `intimidate` returned `'fled'`, plan gone, companion
  party emptied, stage fell back to `party`, `removalCleanups`
  +1. If the roll snaps instead, the case retries on the next
  withdrawn villager/seed — a snap is a fight, not a removal,
  and the game is abandoned for that attempt.
- **splinter** — REAL TRIGGER `Game._maybeResolveContendArc(cid,
  arc)` (game.js:5412, removal at game.js:5449), driven through
  the same call the stand-ground flow makes (game.js:5696). Staged
  arc `{ stoodDown: 9, yielded: 0, state: 'open' }`, trust pinned
  to 10, no task domain. PROBE FINDING (frozen into the design):
  a `respect` resolution bumps trust +4, so re-rolling the same
  arc WITHOUT re-pinning trust closes the `canLeave`
  (`trust <= 25`) window after ~4 resolutions — 120 attempts
  with trust pinned once never left; with trust re-pinned to 10
  before EVERY attempt the splinter fired in 21 attempts. The
  re-pin maintains the staged precondition (a low-trust
  leadership loser) across retries; it does not touch the roll.
  Loop cap 200 attempts; if it never fires, the how is UNSTAGED
  with this mechanism named. Probe: 21 attempts, plan gone,
  companion fell back to `party`, `removalCleanups` +1.
- **exiled** — REAL TRIGGER `Game.freeloadVote(vid)`
  (game.js:31756, moot vote-out). Majority by `pairAffinity < 10`
  (fresh-village affinities are 0 except shared-group/bond
  pairs). Probe: 8–3 vote, plan gone, companion fell back to
  `party`, `removalCleanups` +1. The trial-sentence path
  (betrayal.js:2220) is the SAME how through a second caller; it
  is NOT staged separately — the bar is per how, and the vote-out
  is the staged real trigger for `'exiled'`.
- **tribute** — REAL TRIGGER `Game.ladderDeliverCapstone(
  'military_tribute')` (table.js:206), after staging two living
  wave-4 veterans in `state.waveKillLog` (`{ by, w: 4 }` for two
  living NPCs; `ladderCapstoneReady` reads ready, 2 payable).
  Probe: delivery `{ ok: true }`, BOTH veterans off the roster,
  both plans gone, companion purged, `removalCleanups` +2.
- **relay** — REAL TRIGGER the defiant path's price beat:
  `Game.tableStartPath('defiant')`, then
  `Game.tableChoose('beat:grain')` for beat 0 (the food price,
  taken as dignity with no pantry cost), then
  `Game.tableChoose('beat:name')` at beat 1
  (table-defiant.js:170/185). `relayPerson()` picks the
  highest-trust living villager, so the holder's trust is pinned
  to 95 (others 10) — the staged precondition is "the village's
  most trusted person", which is what the price names. Probe:
  `relayTaken` set, holder off roster, plan gone, companion fell
  back to `party`, `removalCleanups` +1.
- **tbEnd fled betrayer** — REAL TRIGGER the betrayal-fight flee:
  `Game.npcBetrays(vid, { reason: 'rage' })` starts the fight;
  the hostile fighter's HP is set to 20% (a losing betrayer —
  the flee check is `hpFrac < 0.3` + 0.4 roll, before any strike);
  `Game.tbHostileTurn(h)` is driven until `h.fled`, then
  `Game.tbEndCheck()` resolves the fight through the party.js
  choke-point routing (`removeVillager(fled.villagerId,
  'fled')`). A BOLD betrayer is used so the yield check
  (`hpFrac < 0.12`) cannot fire first at 20% HP. Loop cap 40
  hostile turns. Probe: fled, fight resolved, betrayer off
  roster, plan gone, companion fell back to `party`,
  `removalCleanups` +1.
- **No-creation case (bar 3)** — a fresh game in which the
  village holds NO winPlan store at setup: a plan-less villager
  is removed through `freeloadVote`, and the proof asserts
  immediately afterwards (before any `runDays`) that no
  `winPlan` / `winPlanStats` key was created by the removal call
  alone. If `setupGame` already leaves a store on the chosen
  seed, the case is void with the reason recorded, and the
  unit-level no-creation checks in `test-nondeathplan-b.js`
  stand as the regression proof.

What is NOT a real trigger (frozen): a direct
`Game.removeVillager(vid, how)` call proves the choke point, not
the trigger — the unit cases in `test-nondeathplan-b.js` already
do that. This arm uses direct calls ONLY if a real trigger proves
unstageable, and then the verdict names that how as observed
through a direct call, not a trigger.

## Primary metric + GO bars (frozen — coordinator follow-up)

Primary metric: **the leave hook firing live per removal how**
(`winPlanStats.removalCleanups`), with zero lingering entries and
zero lingering party refs 7+ days after each staged removal.

GO iff ALL hold:

1. **Live firing per how.** `removalCleanups > 0` for EVERY how
   exercised through a REAL game trigger — fled, splinter,
   exiled, tribute, relay, and the tbEnd fled-betrayer routing.
   Fixture-proven hows do not count toward this bar. A how that
   cannot be staged live is reported UNSTAGED with the reason,
   never faked; partial live coverage is a real result, and a
   UNSTAGED how fails this bar.
2. **No lingering.** Lingering entries 0 AND lingering party refs
   0, 7+ days after each staged removal (same 7-day rule as
   sim-nondeathplan-b: a planCensus-style read of the live
   village 10 days after the removal — holder entry absent,
   no living holder's party names the leaver).
3. **No ignition.** A plan-less staged village gains no winPlan
   store from the removal calls alone (the no-creation case
   above).
4. **Proof green.** `scripts/test-nondeathplan-live-b.js` green
   on the branch tip (per-how live legs + the #2482 classifier
   proof below).
5. **Cost.** Staged sims complete with 0 instrument errors and
   no new death modes introduced by the staging itself (the
   10-day competent runs end `survived` or with only deaths the
   competent policy produces on an unstaged seed; any death
   caused by the staging is named).

Verdict naming (frozen): the evidence names, per how, REAL
TRIGGER vs DIRECT CALL vs UNSTAGED. The overall verdict is GO
only if every how is REAL TRIGGER and bars 1–5 hold.

## Finding #2482 — deadplan slot-count classifier (in scope)

The deadplan classifier counts the death day's own census row as
a slot holder-day, so a band reads COSTLY with zero lingering.
Root cause (frozen): in `scripts/analyze-deadplan-b.js` (c-i),
a census row counts when `deathDay[pid] <= r.day` — but the daily
snapshot precedes the death within the day, so a party ref to
someone who dies LATER that day is not stale at all.

- **Fix (frozen):** exclude the death day — the ref counts only
  when `deathDay[pid] < r.day` (strict). No threshold change
  elsewhere: a ref on the day after the death IS a linger (the
  cleanup should have deleted it on the death day), so
  holder-days >= 2 is NOT the rule — the death-day exclusion is
  the principled fix, and it subsumes the >= 2 reading for the
  observed instances.
- **Baseline (frozen, measured pre-fix on the existing corpora
  2026-11-17):** `classify` on
  `evidence/2026-11-17/perseed-nondeathplan-b-armed/` =
  **COSTLY, poolTotal 0, slotTotal 3, validityOk true** — the 3
  slot holders are all single-day death-day rows: 103244
  `catalina_reyes` naming `gen_8noj3cq` d114 (died d114); 103247
  two holders naming `katarina_novak` d65 (died d65).
- **Bar (frozen):** after the fix, `classify` on the SAME corpora
  reads **slotTotal 0, verdict NOISE-ONLY** (poolTotal stays 0).
  The proof test also carries synthetic corpora: (a) death-day
  only refs → 0 holders; (b) refs on the death day AND the day
  after → the holder counts with `days: 1` (the post-death row
  is a linger); (c) refs 2+ days after → `days` counts the
  post-death rows only. `scripts/test-deadplan-b.js` (which
  classifies a clean synthetic corpus as NOISE-ONLY) must stay
  green — it is run as a regression gate.
- **Scope guard (frozen):** if the classifier fix fights back,
  split it out and say so — it must NOT block bars 1–5. Mark
  #2482 claimed, then fixed, in `sim-findings.md` alongside
  #2481/#2475.

## Instrument (frozen)

- `scripts/test-nondeathplan-live-b.js` — the proof AND the
  judged runs (one script, sections): (1) static — the fix is
  present in the tree (`winPlanOnVillagerLeave` exists, the
  `removeVillager` else-branch hook, the party.js choke-point
  routing, `removalCleanups` bump line) and the deathcleanup pins
  still hold (exactly two `delete v.winPlan[vid]` spellings, death
  bump line exact); the branch src diff vs merge-base touches
  ONLY the proof test, the prereg/evidence, and the classifier
  fix (`scripts/analyze-deadplan-b.js`) — NO game-code change is
  expected in this arm; (2) per-how live legs — one fresh seeded
  game per how, staged as in §Staging design, asserting at the
  removal instant (off roster, plan gone, party purged, stage
  fallback, exact `removalCleanups` bump) and again after 10
  competent days (lingering 0); (3) no-creation live case; (4)
  #2482 classifier proof (synthetic corpora + re-classify of the
  103241–103248 armed corpora); (5) `test-deadplan-b.js` re-run
  as a regression gate (its classify assertions must hold).
- No new driver, no new analyzer, no corpus writes: the staged
  fixtures run in-memory inside the proof test. The 10-day runs
  use the competent policy verbatim (sha256
  `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`,
  verified in the worktree before this commit).
- Seeds: fled 103241, splinter 103243, exiled 103244, tribute
  103245, relay 103246, tbEnd-fled 103247 (the probe seeds —
  frozen so the judged runs are reproducible; these are the
  sim-nondeathplan-b band seeds, reused as fixture seeds, not as
  a new measurement band). The no-creation case uses the first
  seed in the band whose `setupGame` leaves no winPlan store.

## Horizon, policy, death-awareness

- Horizon: staged removal + 10 competent days per how (covers
  the 7-day lingering rule with margin). Death-aware in the
  limited sense the fixtures need: if a 10-day run ends in
  village death, the run is reported with its end reason and the
  lingering check is read from the days that ran — a death
  before day 7 voids that case with the reason recorded (bar 5
  then judges whether the staging caused it).
- Policy: competent verbatim (see §Instrument). No policy
  variants — this is a proof arm, not a comparison.

## Sense-testing (mandatory)

For each staged removal, read the captured say lines around the
removal AND after the 10-day run: does the village talk about the
leaver correctly afterwards — as gone, walked out, exiled, paid
away — with no one planning with a ghost (no line that treats
the leaver as still holding a plan, still walking with a party,
or still in Haven)? One such line is a finding, not a rounding
error — name it in the evidence with the line quoted. Also name
the leaver's story per how: who they were, what their plan was,
how they left, what the village said.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-17/perseed-nondeathplan-b-armed/*.json'
--metrics national,table,wins,exiled`. Record the outcome
(including a documented refusal — the recorder corpus was
refused by this check on the nondeathplan arm) — do not work
around a refusal.

## Wall numbers (report every run)

The staged fixtures are 10-day proofs, not 150d wall sims — the
wall numbers are reported from the parent band they share
(sim-nondeathplan-b, both legs identical): national by standing
2/8, national by scaleRank 0/8, table 0/8, wins 0/8, wave-4
reached 8/8, wave-5 reached 2/8, wave-4 kills 15, wave-5 kills 3,
median survival 143d, deaths 570. The staged sims change nothing
about the wall; say so in the evidence.

## Findings note (frozen)

- #2481 (non-death removals never fire under the competent
  policy) → claimed by this arm; fixed when bar 1 is met (live
  firing observed per how — the observation the finding asked
  for), else partially fixed with the staged hows named.
- #2475's "needs a live observation" (the file's #2476 line,
  "NON-DEATH REMOVALS LEAVE PLANS LINGERING" — the closeout and
  the nondeathplan evidence cite it as #2475, but
  `sim-findings.md` carries that text under #2476, with #2475
  being the 52-day party-stage wait) → update the status of the
  LINGERING line to record the live observation, and note the
  numbering discrepancy in the evidence so the next reader does
  not chase a phantom #2475.
- #2482 (deadplan slot-count includes the death day) → append
  as [open] with this arm's provenance, then mark claimed and
  fixed when the classifier bar is met (or split out with the
  reason if it fights back).

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Did every how fire through its real trigger, or did any fall
  back to a direct call / go UNSTAGED — and why?
- Did the stage fallback (`hunt` → `party` on empty) fire on
  every removal, and did any holder re-seek a companion within
  the 10 days (as the exiled probe's companion did — back to
  `hunt` by day 11)?
- Did any say line after a removal treat the leaver as still
  planning or still present?
- Did the no-creation case hold live, or was it void (store
  already present at setup)?
- Did the classifier fix change any other verdict (pool counts,
  `test-deadplan-b.js`, the deathcleanup band)?
- Was 10 days the right observation window, or did lingering
  need longer to show?
