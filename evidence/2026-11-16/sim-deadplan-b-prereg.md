# sim-deadplan-b — PREREG (binding)

Run: fleshout-loop-b-20261117T0430Z (Loop B), axis winnability chain, arm
sim-deadplan-b — DIAG: does a dead plan-holder's lingering winPlan cost
anything (pool pollution, companion-slot blocking, census noise) or is
it noise-only? Findings backlog item, named next diagnostic #3 by
sim-haventick-b. Branch `sim-deadplan-b` (worktree
`~/workspace/worktrees/sim-deadplan-b`). Base: master `eb8e0cc18` at
arm start (the worktree HEAD; master has since moved under Loop A —
do NOT rebase mid-run, the coordinator owns the rebase at landing).
Binding prereg: THIS file — frozen before any judged sim. The
instrument (driver, analyzer, proof test) is built AFTER this commit;
no judged numbers exist yet. Commit this file FIRST
(`scripts/safe-commit.sh "sim-deadplan-b: frozen prereg — ..."`),
then build.

## The question, in plain words

A villager starts a win-plan (a gameplan: gear up, gather a party,
walk out and hunt the beasts the village needs dead). The villager
dies. The plan does not die with them: the only `delete
v.winPlan[vid]` in the code is the table-active case
(`src/js/win-plan.js:321`, in `winPlanHavenTick` — the table-active
branch; line numbers drift, the call text is the anchor), and there
is NO death cleanup. Haventick measured the linger: post-death
census tails run to 101–102 days, 2,075 of 4,078 out-of-episode
census rows across 8 seeds. The open question is whether the linger
COSTS anything — a dead holder's plan polluting the launch pool, a
dead holder holding a companion slot, a dead plan counted where a
living one should be — or is only noise. This DIAG answers it with
counts, on master as-is, with a recorder-only instrument (zero
game-behavior change).

## Prior art (read first)

- `evidence/2026-11-16/sim-haventick-b.md` + prereg — the instrument
  this arm EXTENDS (extend `scripts/haventick-driver-20261116.js`,
  `scripts/analyze-haventick-b.js`, `scripts/test-haventick-b.js`;
  don't rebuild). Its §Analyzer fix table is the background: the
  only `delete v.winPlan[vid]` is the table-active case; no death
  cleanup; `postDeathTail` rows 1,362 (instrument) / 713 (control)
  across 8 seeds, tails to 101–102 days. Its §Next diagnostic #3
  names this arm.
- `evidence/2026-11-16/sim-seedpaths-b.md` + prereg;
  `evidence/2026-11-16/sim-poolmarginals-b.md` + prereg;
  `evidence/2026-11-16/sim-companionpool-b.md`.
- `docs/CANON.md` (read first), `docs/PARTY.md`,
  `docs/MONSTER-WAVES.md` (wave 4 "The Mirror Draft"; the doc lists
  9 wave-4 ids, the data has 10 and the data rules — seedpaths
  established this), `docs/MEASUREMENT.md` §§9–12, 14–15.
- CANON GAP (recorded, not invented): no CANON-registered doc covers
  winPlan lifecycle or death cleanup (checked 2026-11-17 against
  the `docs/CANON.md` manifest). The question is grounded only in
  `src/js/win-plan.js` and its readers, listed in §Static
  grounding below. The evidence file states this gap instead of
  inventing canon.

## Static grounding (verified in this tree before this commit)

Every `winPlan` touch point in `src/js`, and what it does with a
dead holder (line numbers drift; call text is the anchor):

- `winPlanOf(vid)` (`win-plan.js`) — creates a plan when missing.
  Called from `winPlanDepart` launchParty (companion plan) and the
  dawn executor (`villager-brain.js:1039,1090-1095`, companion plans
  at launch). Callers always pass a living companion (see
  `findCompanion` below) — the recorder verifies this per call.
- `winPlanSeedFromFight` — called for the fighter from game.js
  field fights and agency `expeditionMonster` (evade/flee). The
  fighter is alive at the call (a dead villager fights nothing).
- `winPlanNoteFight` / `winPlanNoteKill` — same fighter, same.
- `winPlanHavenTick` / `winPlanDepart` — called from agencyTick
  (`villager-agency.js:433,447`) for roster `rid` only after
  `if (vp && vp.dead) continue;` — the dead never reach them.
- `winPlanFightGate` — called for the fighter from
  `expeditionMonster`; its VETREENGAGE co-tasked count skips dead
  party members explicitly (`if (!alive(this, pid)) continue;`).
- `winPlanSecondCompanion` — picks from the roster with an explicit
  `if (!alive(this, cid)) continue;` filter.
- `findCompanion` (`win-plan.js`) — first-companion pick, explicit
  `if (!alive(self, cid)) continue;` filter.
- `planActorsAtHaven` (`win-plan.js`) — iterates ALL plans in
  `winPlan` (the one whole-census read in game code) but filters
  `if (!alive(self, vid)) continue;` before returning an actor.
  Feeds `winPlanBondsTick` / `winPlanMusterTick`.
- `winPlanCands` (`villager-brain.js:193`) — dawn candidate pass,
  reads `vv.winPlan[vid]` for the scored villager; the dawn pass
  scores living villagers (verified empirically: every
  `dawnbidScores` row carries `holderAlive`, bar 3).
- `winPlanStats` — bump-only event counters (`planSeeds`,
  `stageAdvances`, `partyDepartures`, `partyWaits`, `avoidances`,
  `partyDissolved`, `bondTends`, `musterStanddowns`); no game code
  reads a plan count from them. `standing.js`, `progression.js`,
  `hierarchy.js`, `table.js` contain NO `winPlan` reference — no
  standing/table gate reads a plan.
- `alive(self, vid)` = the person exists and `!p.dead`
  (`win-plan.js`).
- The static picture says NOISE-ONLY: every live decision path
  filters the dead before it reads a plan, and the only whole-
  census read filters too. The DIAG exists because a static read
  is not a measurement — the recorder counts every touch, and any
  single dead-holder touch the static read missed is a COSTLY
  instance by definition (bar 3).

## Design — the dead-touch recorder (frozen)

The driver extends the haventick driver unchanged for its existing
arrays (`v4seeds` / `v4departs` / `v4gates` / `v4encounters`,
`dawnbidScores` / `dawnbidDeparts` / `dawnbidCensus` /
`dawnbidStarts`, `companionPool`, `v4creates`, `planCensus`) and
adds ONE array, `deadTouches`, plus `holderAlive` on the rows the
question needs:

- `deadTouches`: one row per wrapped `winPlan` entry-point call
  where the subject is dead at call time — OR, for the
  completeness proof, the analyzer counts ALL wrapped calls and
  reports the dead share per method (the row carries
  `holderAlive`; a dead row is a touch, a live row is the
  denominator). Methods wrapped: `winPlanOf`, `winPlanHavenTick`,
  `winPlanDepart`, `winPlanSeedFromFight`, `winPlanNoteFight`,
  `winPlanNoteKill`, `winPlanFightGate`, `winPlanSecondCompanion`,
  `winPlanBondsTick`, `winPlanMusterTick`, `vbrainExecuteDepart`.
  Row: `{day, method, vid, holderAlive, planExistedBefore,
  planExistedAfter, caller}` plus method-specific extras:
  `winPlanOf` — whether the call CREATED a plan (`created`,
  the smoking gun: a plan created for a dead villager);
  `winPlanDepart` — result + `partyBefore`/`partyAfter`;
  `winPlanFightGate` — result + `partyDeadMembers` (dead vids in
  the holder's `plan.party` at gate time);
  `winPlanSecondCompanion` — `pick` + `pickAlive`;
  `winPlanBondsTick`/`winPlanMusterTick` — `actor` + `actorAlive`.
  All wraps are pure reads + driver-local writes, no RNG, no
  game-state writes. A wrap that throws records an instrument
  error and fails bar 1.
- `holderAlive` added to: every `v4creates` row (a creation for a
  dead vid is a costly instance), every `dawnbidScores` row (a
  scored dawn for a dead holder is pool pollution), every
  `v4departs` row (holder + every party member alive at depart),
  every `companionPool` row's `rankedPick` (explicit `rankedPickAlive`;
  the members array already carries `alive` per member).
- `planCensus` unchanged from haventick (every holder every day:
  vid, target, needWave, stage, party, `holderAlive`, node, exped,
  sick, health, gear) — the independent denominator for (a) and
  (d). A `plan.party` array containing a dead vid is recorded as
  a `deadPartyRef` in the analyzer (census-side), not as a
  `deadTouches` row: the ref itself is the slot question (c).

Legs (both on master as-is — NO seed call anywhere in this arm;
there is no instrument leg in the haventick sense):

- OFF leg — recorder off (`DEADPLAN_RECORDER=off`), master as-is.
  Carries empty recorder arrays. Exists for D2 neutrality and
  the wall-number comparison.
- ON leg — recorder on, master as-is + recorder wraps only.
  The judged corpus. Both legs run identical seeds, same
  policy/horizon. "Before/after on identical seeds" here is OFF
  vs ON trajectories (D2) plus wall numbers per leg — the game
  code is identical on both legs, so any trajectory difference
  is recorder interference and fails bar 2.

## The four counts (frozen definitions)

(a) **Linger share.** `planCensus` rows with `holderAlive` false
as a share of all census rows, per seed and pooled, split by
day-bucket 0–30 / 31–60 / 61–90 / 91–120 / 121–150, plus the
longest single dead-holder tail in days per seed (first census
day the holder is dead → last census day) and the count of
distinct dead holders whose plans linger ≥30 days.

(b) **Pool pollution.** Count, across the ON corpus, of selections
whose holder is dead at selection time, each with the selecting
code path named: (i) `dawnbidScores` rows with `holderAlive`
false; (ii) `companionPool` rows with `rankedPickAlive` false;
(iii) `v4departs` rows with a dead holder or a dead party
member; (iv) `deadTouches` rows for `winPlanDepart` /
`winPlanHavenTick` / `winPlanSeedFromFight` / `winPlanNoteFight` /
`winPlanNoteKill` / `winPlanFightGate` with `holderAlive` false;
(v) `winPlanSecondCompanion` rows with a dead pick; (vi)
`winPlanOf` rows with a dead vid (creation for the dead counts
double: a touch AND a creation). Zero on all six is the
NOISE-ONLY side of the pool question; any nonzero row is
enumerated in the evidence with day, seed, vid, and caller.

(c) **Slot.** (i) Census-side: living holders whose `plan.party`
contains a dead vid — count of distinct holders, count of
holder-days, and for each such holder whether they launched
after the dead ref appeared (a later launch proves the ref did
not block them; a hold/never-launch after is listed, not
assumed). (ii) Launch-side: any launch (`v4departs` result
`launch`) whose party at launch contained a dead vid — count
0 expected. (iii) `winPlanOf` creation for a dead vid (bar 3b)
is also a slot instance (a dead holder occupying a plan slot
the code then treats as a holder). There is no numeric party
cap in the winPlan pool code (the pool is filtered, not
capped), so a slot cost can only show through (i)–(iii).

(d) **Census noise.** Per seed per day: plan count including
dead holders vs excluding them (mean and max inflation over
the run, and on the final day). Plus the downstream check: no
game reader consumes the raw census (static, §Static
grounding) and `winPlanStats` is event-bump counters, so
excluding dead-holder rows changes no game-visible number —
verified in the analyzer by recomputing the per-day plan
counts both ways and by listing every game-code `winPlan`
reader with its alive filter (the list in §Static grounding,
re-verified by grep at evidence time).

## Primary metric + GO bars (frozen)

Primary metric: **the cost classification of the dead-holder
linger — COSTLY or NOISE-ONLY — with the counts behind it.**

GO (DIAG GO = instrument valid + linger classified) iff ALL hold:

1. **Corpus 8/8 valid on the ON leg, 0 instrument errors, 0
   unknown.** Every `v4creates` row carries a named creator and
   (for havenTick) a named source; every `v4seeds` row carries a
   named path; every `deadTouches` row carries a named method
   and a boolean `holderAlive` (never null/unknown); 0
   `unknown-*` anywhere on the ON leg.
2. **Proof green**: `scripts/test-deadplan-b.js` — static /
   classifier / analyzer-fixture green + determinism D1
   (recorder ON twice, identical full corpus) + D2 (recorder ON
   vs OFF, identical trajectories) on the ON tip (seed 103221,
   60d), and green again in the off shape after the run (same
   shape as haventick's 60/60). D3 drift smoke
   (`scripts/vetparty-drift-check.js` over both corpora): any
   drift flag is investigated, not waived.
3. **Cost classification — the linger is classified COSTLY or
   NOISE-ONLY with the counts behind it.**
   - NOISE-ONLY iff: pool pollution (b) is zero on all six
     sub-counts AND slot (c) is zero on all three sub-counts AND
     every `deadTouches` dead-holder call is zero (the
     completeness count, all methods) AND census noise (d) is
     shown to change no game-visible number.
   - COSTLY iff any (b) or (c) sub-count is nonzero: every such
     instance is enumerated (day, seed, vid, code path, caller)
     and the evidence names the concrete next lever (death
     cleanup in `win-plan.js`) WITHOUT building it — this arm
     is a DIAG.
   - The classification is never re-scored mid-run; metric
     doubts go under "metric review".
4. **Wall numbers on both legs**: national by standing ≥200,
   national by scaleRank, table, wins, wave-4 unlocks, wave-5
   unlocks, median survival, wave-4 kills, deaths.

The VERDICT is the classification plus the four counts. A DIAG
GO means the instrument is valid and the classification is
trustworthy — not that the linger is good or bad.

## Seed bands (fresh — verified, not reused)

- Band: **103221–103228** (8 seeds), OFF leg first (recorder
  off), then ON leg (recorder on), identical seeds, same
  policy/horizon.
- FRESH: `grep -rl "103221" evidence/*/sim-*-prereg.md`
  returns nothing for every seed in the band (verified
  2026-11-17 in the worktree, per-seed over
  `evidence/*/sim-*-prereg.md` AND `evidence/*/sim-*.md` —
  zero hits for 103221, 103222, 103223, 103224, 103225,
  103226, 103227, 103228); full recursive `grep -rln` over
  `evidence/` matched 10 files, every hit verified by context
  to be a coincidental numeric substring, none a seed band
  (arrears `103225`, pantryKcal `103228`, `ate` `1032257`,
  decimal `89.1032258…`, nourishment `103225.25…`, a hex hash
  containing `103225`, `10322246183`, `103227329166`); the
  band is in no earlier arm's forbidden list. This is a fresh
  screening band; there is no cross-band comparison in this
  arm — both legs run this band only.
- NEVER 100621–100636, 100861–100868, 100821–100828, 100721–100728,
  100761–100768, 10100–10139, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568 (the poolmarginals
  forbidden list, carried over).

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js`
  — sha256
  `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`,
  verified in the worktree before this commit; note it differs
  from haventick's `74a890f0…` — the policy file has changed
  since, master moved).
- OFF anchor = the instrument commit (driver + analyzer + proof
  test, recorder OFF by env); ON anchor = the same commit with
  the recorder on. No seed call, no game-code change on either
  leg: the branch's `src/` is byte-identical to the base
  `eb8e0cc18` throughout. The instrument is driver-side wraps
  only (pure reads + driver-local writes, no RNG, no state).
- VETREENGAGE is OFF in these sims (env unset) — the
  VETREENGAGE dissolution branch in `winPlanHavenTick` and the
  trio path in `winPlanDepart` / `winPlanFightGate` do not fire;
  stated so a later reader does not mistake their absence for a
  finding.

## Sense-testing (mandatory)

Read transcripts. Read the per-holder stories: for every dead
holder whose plan lingers ≥30 days, say who they were, when
and how they died, what their plan was (stage, target, party),
and whether anything in the village's talk or behavior ever
treated the dead holder as still planning (a launch naming
them, a dawn score for them, a companion picked from them).
One line where the village acts as if a dead holder is still
in the game is a finding, not a rounding error — name it in
the evidence. Also read the `vetSays` lines for the dead
holders' last days.

## Balanced panel (per docs/MEASUREMENT.md §15 — evaluated)

No balanced panel will be run for this DIAG, same as dawnbid,
companionpool, poolmarginals, seedpaths, and haventick. The
panel (`scripts/balance-panel.js`) runs fresh multi-policy
sims and compares two panel `.json.gz` files — it cannot
compare recorder corpora, and this arm ships no game change:
both legs are master as-is, the instrument is
observation-only, and the prereg bars are the judge. A panel
here would measure recorder noise across fresh trajectories,
not the judged corpora. The neutrality proof (D1/D2/D3) is
the panel's substitute here. This decision is recorded here,
not silently skipped.

## Telemetry deviation check

Same as haventick: the telemetry baseline refuses
recorder-corpus input; run it, record the refusal, do not work
around it.

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Did any wrap miss a `winPlan` touch (a `planCensus` holder
  with no `v4creates` row, or a dead-holder call the wraps
  never saw because the caller is module-internal — e.g.
  `winPlanCands` reading a dead holder's plan without any
  wrapped method firing)? Name the missed hook.
- Was 150d the right horizon, or did dead-holder tails cluster
  at the tail (tails still growing at day 150)?
- Did the OFF leg reproduce the ON leg's wall numbers closely
  enough to trust D2 (same game code — report the counts,
  don't assume)?
- Did `winPlanOf` creations for companions matter to the slot
  question (a companion's plan naming a holder who then died)?

## Wall numbers (report every run)

National (standing ≥200 AND scaleRank), table, wins, wave-4
unlocked, wave-5 unlocked, median survival, wave-4 kills, deaths —
per leg.
