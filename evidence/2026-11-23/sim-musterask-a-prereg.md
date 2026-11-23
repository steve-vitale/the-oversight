# sim-musterask-a — PREREG (frozen)

**Arm:** sim-musterask-a · **Loop A run:** fleshout-20261123T1815Z
**Axis:** scale-onramp (converging, NOT converged) · **Finding:** tracker
blank #1 — NAME THE DAWN-SCORING GAP: the 82 never-scored holder-days
from sim-muster-a (`hidden_files/sim-findings.md` line 2719,
evidence/2026-11-23/muster-a-analysis.json)
**Type:** DIAGNOSTIC (no game change; instrument-only driver/analyzer
extension; zero `src/js` changes unless a probe proves a recorder
defect — then instrument-only with its own proof)
· **Base master:** `dbe748d46df6345dea460d4d72876feee932daa6` (worktree
`~/workspace/worktrees/sim-musterask-a`, branch `sim-musterask-a`;
fast-forwarded onto master at run start 2026-11-23 ~18:32 UTC per the
coordinator's brief — one evidence-only commit ahead of the muster-a
base; see §0b for the substrate delta)
**Frozen:** 2026-11-23 ~18:45 UTC, before any judged run. No judged run
has run.

## 0. Why this run (read first)

On the muster-a pilot band 107617–107624 (8 seeds, 150d, competent
verbatim), 813 eligible-0 events were counted and 731 named (89.9%),
but 82 stayed unclassified — ALL population-B "never scored, sub-cause
unknown": holder alive, at Haven (4,4), not on expedition, holding a
wave-4+ plan at end of day, yet no part-0 muster row at any part (the
dawnbidScores stream agrees the holder was never scored that day).
Stage hunt 58/82, party 21/82; 40/82 lack an igniteCensus row entirely;
23/82 engaged at end of day. Sense case: seed 107617 visjoin_84 (plan
created d100, stage party, target congregation) — scored d101–d105,
d108, d110, but never d106/d109 (engaged, at Haven, alive) while d110
was scored despite engaged:true, so end-of-day engagement does not
deterministically block scoring. The frozen taxonomy names no
dawn-state cause, so these stay unclassified per muster prereg §5b #2
— the pilot gate failed as frozen, no confirm spend.

The question this arm answers: is the gap a dawn-state fact
(away/engaged/at-Haven AT DAWN vs the end-of-day state the analyzer
uses) or an extended-taxonomy sub-cause? Read the dawn scoring path in
code (`villager-objectives.js` objPick / objTick / vbrainFeedExtras →
`villager-brain.js` winPlanCands) and find WHY a plan-holding holder is
never scored on those days.

## 0a. What the code already says (read before the run)

The dawn scoring path, in order, per holder (all line numbers on this
arm's base `dbe748d46`):

1. `objTick()` (`src/js/villager-objectives.js:1764`) runs once per
   day-part from the `npcNodeTravel` wrap, after the away-system and
   agency run. At dawn (`dayPart === 0`) it re-picks ONLY a villager
   whose current objective is missing/idle/done/returning:
   `if (!o.kind || o.kind === 'idle' || o.state === 'done' ||
   o.state === 'returning') this.objRefreshPick(rid, hx, hy,
   { dawn: true })`. **A holder whose objective is still live at dawn
   gets no re-pick at all — no objPick, no feed, no score.**
2. Before the dawn block, `objTick` skips, in order: the scholar
   (`rid === this.villagerId`), the dead, the engaged
   (`isEngaged(rid)`), and agency-expedition villagers (objective
   forced to EXPLORE/expedition + `continue`). Away villagers skip
   the re-pick (`dawn && !away`) and then `continue`.
3. `objRefreshPick` (`villager-objectives.js:376`) refuses a refresh
   only when `vbrainOwnsDawn()` and `!vbrainShouldRefresh(vid, opts)`
   and no emergency — and `vbrainShouldRefresh`
   (`villager-brain.js:796`) returns TRUE whenever `opts.dawn` is set.
   **At dawn the refresh is never refused.** The commitment gate
   (`commitDayPartStale`: a commit written TODAY is not stale) blocks
   only MID-DAY refreshes.
4. `objPick` (`villager-objectives.js:388`) calls `vbrainFeedExtras`
   at line 660 — but ONLY on the lottery path. The early returns fire
   BEFORE it: LEAVE (escape goal), REST (energy < 35), EAT (hunger >
   55, pantry > 500), HAUL (fresh kill), SEEK (wants knowledge).
   **A holder picked by an early return is never fed, never scored —
   and the gate pick writes a same-day brain commit
   (`vbrainLogGate`), which then blocks any mid-day refresh, so the
   silence lasts the whole day.**
5. `vbrainFeedExtras` (`villager-brain.js:854`) calls `winPlanCands`,
   which calls `findCompanion` once (`villager-brain.js:153`) after
   the gear-stage early return. If the feed runs with a wave-4+ plan,
   the muster wrap records a row — so a never-scored holder-day means
   the feed never ran, or ran while the plan was not wave-4+.

Candidate mechanisms, in the order the code evaluates them:
scholar-at-dawn · engaged-at-dawn · away-at-dawn ·
on-expedition-at-dawn · not-at-Haven-at-dawn (node check runs AFTER
the dawn re-pick, so it alone does not block scoring — recorded for
completeness) · off-roster / no person record · pick-early-return
(REST/EAT/SEEK/HAUL/LEAVE) · objective-live-all-day ·
plan-created-after-dawn.

## 0b. Base + substrate delta vs the muster-a frozen base

This arm's frozen base is `dbe748d46` (coordinator-directed
fast-forward; the worktree was one evidence-only commit behind tip).
The muster-a corpus was recorded on `8a949703`. Substrate delta
`8a949703..dbe748d46`, verified by `git diff --stat`:

- `src/` diff is TWO files only: `src/js/build.js` (version stamp,
  no behavior) and `src/js/convoTopics.js` (+54: stage-2 prefixed
  retry in topic2Ask, journey-succession r268). `convoTopics.js`
  contains ZERO `R()` calls (verified by grep), so the retry draws no
  RNG; its extra `t2fill` calls are pure string fills.
- `scripts/policies/` (tableseat-nowait, leanlinkrescue, competent),
  `src/data/monsters.json`, `src/js/villager-objectives.js`,
  `src/js/villager-brain.js`, `src/js/win-plan.js`,
  `src/js/standing.js`: byte-identical (empty diff).
- Everything else in the range is evidence/scripts/docs for other
  arms (no game behavior).

The replay is therefore expected to reproduce the frozen corpus
exactly; bar 4 (§6) tests that expectation, and the drift provision
(§7 step 2) governs if it does not.

## 1. Frozen corpus (the 82-set)

- Per-seed corpora: `evidence/2026-11-23/perseed-muster-a-ctl/`
  (8 files, `muster-a-s10761[7-9]-muster-a-ctl.json`,
  `muster-a-s10762[0-4]-muster-a-ctl.json`).
- Analysis: `evidence/2026-11-23/muster-a-analysis.json` — 813
  eligible-0 events, 731 classified, 82 unclassified; cause totals:
  never-asked:holder-not-scored 592, pool-empty:away 78,
  pool-empty:notRanger 61, unclassified 82.
- The 82, by seed: 107617: 4, 107620: 4, 107622: 11, 107623: 12,
  107624: 51. (107618/107619/107621: 0.)
- No new seed bands: this arm REPLAYS frozen band 107617–107624 by
  design (same policy/substrate as muster prereg §3).

## 1a. Pre-registered expectations from frozen-corpus reads (NOT judged results)

Read-only queries against the frozen corpus, recorded here BEFORE
any judged run so the replay probes confirm or overturn them:

- **Scholar-days: 40/82.** The frozen `daily` stream carries
  `scholarId` per day. Cross-checking the 82 against it:
  `gen_o96e0k3` (seed 107624, Otto Herrera) is the scholar on d81–d113
  (33 days) — exactly his 33 unclassified days (d81–d113, the long
  silent run; he was scored d80, the last day before succession);
  `daniyar_askarov` (seed 107623) is the scholar on d132–d138 (7
  days) — exactly his 7 NO-IGNITE-ROW days. The analyzer's
  `holder-is-scholar` check used only the END-of-run `villagerId`
  (`onni_korhonen` / `nathan_lee`), so it missed both mid-run
  successions — and the 40 scholar-days are exactly the 40/82 that
  "lack an igniteCensus row entirely" (igniteCensus skips
  `vid === Game.villagerId`). The dawn sampler must confirm this via
  `dawnState.isScholar` at part 0 (the code mechanism: `objTick`
  skips `rid === villagerId` before any pick). If the sampler
  contradicts the daily.scholarId cross-check, the sampler wins and
  this section gets an AMENDMENT.
- **Plan-created-after-dawn: 3/82.** `v4creates` shows
  `visjoin_84` d100, `james_okonkwo` d111, `daniyar_askarov` d120 —
  all `creator: 'world-tick'` (seeded by a fight/flee during the day,
  not at dawn) with `firstPlanDay == day`. The dawn sampler must
  confirm (no dawnState row + no plan at dawn).
- **Remaining 39/82** (107617: 3 after the 1 plan-created day;
  107620: 4; 107622: 10 after the 1 plan-created day; 107623: 4 after
  the 1 plan-created day + 7 scholar-days; 107624: 18 after 33
  scholar-days) need the dawn sampler: they are non-scholar days on
  which OTHER holders were scored (e.g. 107624 d100: 4 part-0 muster
  rows, none for `gen_o96e0k3`), so the gap is holder-specific, not
  day-wide — except the d58/d59 cluster in 107624 (0 part-0 muster
  rows, 8 holders each day), which the sampler must explain as a day
  fact or a shared holder fact.

## 2. The instrument (new this run)

Copy of `scripts/muster-driver-a.js` → `scripts/musterask-driver-a.js`,
deltas frozen here (all other streams/behavior identical; the
muster/planCensus/igniteCensus/dawnbidScores wraps are unchanged):

1. Output evidence dir 2026-11-23, run `musterask-a`, MODE `ctl`,
   file names `musterask-a-s<seed>-musterask-a-ctl.json`.
2. Anchor pin: `FROZEN_BASE = dbe748d46...` (this arm's base, §0b).
   The CLI refuses to run unless run-time `git rev-parse HEAD` IS
   the frozen base; the corpus records `anchorCommit` +
   `anchorHead` side by side.
3. NEW `dawnState` stream: one row per wave-4+ plan holder at every
   `objTick` ENTRY with `dayPart === 0` (the state the dawn re-pick
   decides on). Row: day, part 0, vid, scholarId (Game.villagerId at
   snapshot), isScholar, onRoster, personExists (getPerson non-null),
   vpDead, engaged (`isEngaged`), away (bool + entry), onExped
   (agencyState.exped), node (`npcNode`), objective
   (kind/state/partsLeft/indoor/purpose — read from the state store
   `state.village.objectives[vid]`, NEVER via `Game.objOf`, which
   lazy-creates entries), plan {stage, target, needWave, party},
   needs {energy, hunger} (read from `state.village.needs[vid]`,
   NEVER via `Game.npcNeeds`, which lazy-creates entries), goal
   (`npcGoal`, pure read), health, sick.
4. NEW `objTickTrace` stream: one row per wave-4+ plan holder at
   every `objTick` ENTRY with `dayPart` 1–3 (the objective lifecycle
   through the day). Row: day, part, vid, objective
   {kind,state,partsLeft,indoor}, isScholar, engaged, away, onExped,
   node, plan {stage, target}.
5. NEW `objPickLog` stream: one row per `Game.objPick` call for a
   wave-4+ plan holder (any part). Row: day, part, vid, planBefore
   {stage, target, needWave}, result {kind, state, partsLeft, indoor}
   (read AFTER the call — the early-return kind IS the mechanism),
   feedRan (muster-row delta across the call: did
   `vbrainFeedExtras` run with this wave-4+ plan inside the pick),
   error (if the pick threw; the wrap rethrows so game behavior is
   unchanged — `objTick` already swallows pick errors silently).
6. NEW `refreshLog` stream: one row per `Game.objRefreshPick` call
   for a wave-4+ plan holder. Row: day, part, vid, opts {dawn,
   force}, shouldRefresh (pure re-read of
   `Game.vbrainShouldRefresh(vid, opts)` before the call),
   outcome ('picked' — an objPick ran inside — vs 'refused'),
   emergency (`objNeedsEmergencyPick` value when refused).
7. The `vbrainFeedExtras` wrap is UNCHANGED (same muster rows); the
   `firstCallerFrame` skip list gains `musterask-driver-a.js`.
8. All new wraps are pure reads + driver-local writes: no
   `Math.random` draws, no game-state writes (objectives/needs are
   read off the state store, never through lazy-creating accessors).
   Zero `src/js` changes.
9. Top-level counts for the new streams, for the instrument check.

New analyzer `scripts/analyze-musterask-a.js`: a copy of
`scripts/analyze-muster-a2.js` with the §5 extended taxonomy only
(the muster/launch/wall logic is byte-identical so `--diff` stays
comparable across the two corpora); `--selftest` required before the
band (one synthetic corpus per new taxonomy row + the old rows
re-run + determinism checks); `--diff` compares two corpus dirs
seed by seed on (classification summary, launches, days).

## 3. Policy + substrate (frozen — identical to muster prereg §3)

- **Policy module:** `scripts/policies/tableseat-nowait.js`,
  layers OFF (`TABLESEATNOWAIT` unset, `LEANLINKRESCUE` unset —
  the driver CLI refuses a layers-on run). Net effect: **competent
  verbatim play**, recorded as
  `policy: 'tableseat-nowait (layers off → competent verbatim)'`
  with the shas of all three policy files on every corpus.
- **Substrate env (read by game code):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND`, `PRESENCE`,
  `KILLBUNDLE`, `HPGATE`, `PINQUAD`, `PROFILEGATE4` unset.
- **Horizon:** 150d death-aware (dead villages stop simulating, +10d
  tail max). Same band, same seeds, same horizon as muster-a — the
  replay is a re-observation, not a new experiment.

## 4. The question

For every never-scored holder-day in the frozen 82-set (or the
replay's set if the replay drifts, §7): WHY was the holder never
scored — which dawn-state fact (scholar / engaged / away /
expedition / off-roster / early-return pick / live objective /
plan-created-after-dawn at dawn, per the code path in §0a) names it,
proven by a replay probe showing the mechanism in code + corpus?

## 5. Taxonomy (frozen — extended; evaluated in order, first match wins)

### 5a. Scored eligible-0 events — UNCHANGED from muster prereg §5b

Causes 1 (`never-asked:stage-gear`), 3 (`pool-empty:<cause>`), 4
(`unclassified`) apply exactly as frozen there. The replay must
reproduce the scored half (139/139 named) as a consistency check.

### 5b. The never-scored holder-day — EXTENDED (first match wins)

`neverScoredDays` (planCensus wave-4+ plan, holder alive at EOD, no
part-0 muster event) keeps the frozen EOD sub-causes first, then the
dawn sub-causes below. A sub-cause names a CODE mechanism (§0a), not
an end-of-day proxy.

| # | Cause | Code-grounded definition |
|---|---|---|
| 2a | `never-asked:holder-not-scored` (EOD, frozen) | `holder-is-scholar` (end-of-run villagerId) / `scored-other-part-only` / `holder-on-expedition` (EOD) / `holder-not-at-haven` (EOD). Unchanged from muster-a. |
| 2b | `never-asked:holder-scholar-at-dawn` | A `dawnState` row that day (or the frozen `daily.scholarId`) shows the holder WAS the scholar that day. `objTick` skips `rid === villagerId` before any pick (villager-objectives.js:1779) — the holder is the player character that day, so no NPC dawn exists for them. The plan persists because cleanup fires only on death. |
| 2c | `never-asked:holder-engaged-at-dawn` | `dawnState.engaged` true. `objTick` skips engaged villagers (villager-objectives.js:1783) before the dawn block. End-of-day engagement is NOT used: d110 was scored despite engaged:true at EOD. |
| 2d | `never-asked:holder-away-at-dawn` | `dawnState.away` true. `objTick` skips the dawn re-pick for away villagers (`dawn && !away`, then `continue`). |
| 2e | `never-asked:holder-on-expedition-at-dawn` | `dawnState.onExped` true. Agency owns the villager; `objTick` forces EXPLORE/expedition and `continue`s. |
| 2f | `never-asked:holder-not-at-haven-at-dawn` | `dawnState.node` not Haven. Recorded for completeness: the node check runs AFTER the dawn re-pick, so it alone does not block scoring — this cause fires ONLY when the dawn row also shows no pick ran and no earlier cause applies. If it ever fires, the evidence says so and asks why. |
| 2g | `never-asked:holder-off-roster-at-dawn` | `dawnState.onRoster` false (and not the scholar). `objTick` iterates the roster; a plan-holder off the roster is never visited. `personExists` false is folded here with the detail naming it. |
| 2h | `never-asked:pick-early-return` | An `objPickLog` row that day (any part) with `feedRan` false and result kind in {REST, EAT, SEEK, HAUL, LEAVE} — the pick ran but the early return fired before the line-660 feed. The detail names the kind(s); when the `refreshLog` shows a mid-day refresh refused on the same-day commit, the detail names that too (the all-day silence). |
| 2i | `never-asked:objective-live-all-day` | `dawnState` objective live at dawn (kind set, state not done/returning/idle) AND no `objPickLog` row that day AND `objTickTrace` rows show the objective live (never done/idle) at every part 1–3. The dawn block's staleness test never fired. |
| 2j | `never-asked:plan-created-after-dawn` | NO `dawnState` row for the holder-day, other holders DO have dawnState rows that day (objTick ran), and the first planCensus / `v4creates` day for that holder+target IS that day (creator `world-tick` when available). The plan did not exist at dawn scoring. |
| 2k | `unclassified` | None of the above named it. The detail records which dawn streams were present/absent (e.g. 'no dawnState row; objTick ran for others' vs 'no dawnState rows at all that day'), never a guess. Must be ≤ 8 on the judged set (bar 1). |

NOT a cause: `armed` / `sick` / `health` never disqualify anyone
from being scored — they are depart-time bars, not dawn gates. The
analyzer reports them only as context, never as a cause.

### 5c. What is NOT a never-scored event (excluded, counted separately)

Same as muster prereg §5c: scored muster days with eligible > 0,
`party_launch` days, holder dead at end of day.

## 6. Pre-registered bars (judge — DIAG-GO / DIAG-NO-GO)

| # | Bar | Threshold |
|---|---|---|
| 1 | PRIMARY — classification completeness | ≥ 90% of the judged never-scored holder-days named with a concrete dawn-state sub-cause (causes 2b–2j count as named; 2k does not). On the frozen 82-set that is ≤ 8 unclassified. |
| 2 | PRIMARY — mechanism proof | Each named sub-cause proven by ≥ 1 replay probe showing the mechanism in code + corpus (a label alone does not count). The probe is the dawn sampler row(s) for a concrete holder-day, cited by seed/day/vid with the code line that skips/returns. |
| 3 | Instrument validity | Proof test `scripts/test-musterask-a.js` green (extended-taxonomy fixtures incl. old-code-fails control: the -a2 analyzer on the same synthetic scholar-day corpus must leave it unclassified — the new name comes from the new stream, not a re-read of EOD state; live-harness sampler shape checks); analyzer `--selftest` green; 0 instrument errors on all judged corpora; tick-gate mismatches 0; the scored half reproduces (139/139 named). |
| 4 | Determinism | Replay of 2 pilot seeds (107617 + 107624) reproduces the classification summary AND the launch count exactly (analyzer `--diff` on the frozen dir vs the replay dir: 2/2 seeds match). If it drifts, §7 step 2 governs — never re-scored silently. |
| 5 | Instrument errors | 0 instrument errors on all judged corpora. |

Balanced panel (§15): N/A — single control leg, no before/after
comparison; the panel is the instrument only where a comparison
applies. No panel is run and none is claimed. The pre-registered
threshold above is the judge either way.

## 7. Pilot → confirm plan

1. Proof test + analyzer selftest green (bar 3, fixtures only).
2. Determinism replay: 2 pilot seeds (107617, 107624) with the new
   driver, recorder on. Analyzer `--diff` frozen dir vs replay dir.
   - If 2/2 match: the judged set is the frozen 82; proceed to step 3.
   - If it drifts: write a prereg AMENDMENT section BEFORE judging,
     recording the drift (which seeds, which fields, the substrate
     cause if identifiable — the §0b delta predicts none), and judge
     the REPLAY's never-scored set instead. Report the drift in
     metric review. Never re-score silently, never silently substitute
     the replay's set for the frozen 82.
3. Full pilot replay: all 8 seeds 107617–107624 with the new driver.
4. Analyzer over the replay corpus; evidence + sense-test (§8).

## 8. Sense-test (frozen)

Seed 107617 visjoin_84 (Kayden Nolan; plan created d100, stage
party, target congregation): read d100–d110 as a story — the dawn
rows (scholar? engaged? away? objective? pick kind?) on the scored
days d101–d105, d108, d110 vs the silent days d100 (plan-created?),
d106, d109. Judge whether the silence is sensible (a tired man
resting at the fire is not mustering; a scholar is not an NPC) or
senseless (a free ranger at Haven, plan in hand, never asked). The
verdict section names the village and quotes the dawn rows.

## 9. Wall numbers (reported every run, never judged)

Wins, national, table, wave-5 reached, wave-4 reached, median
survival, max survival, villages lost, total deaths — on the replay
corpus (8 seeds). Frozen wall for reference: wins 0, national 0,
table 0, wave-5 3, wave-4 8, median survival 150, max 150, villages
lost 2, total deaths 778.

## 10. Metric review (to fill at evidence time, never mid-run)

- Whether the frozen-corpus expectations (§1a: 40 scholar-days, 3
  plan-created days) were confirmed or overturned by the dawn
  sampler — and, if overturned, what the sampler showed instead.
- Whether the EOD state (alive / at Haven / not on expedition) is
  now proven to be a bad proxy for the dawn state, and on how many
  days the two disagreed.
- Whether the d58/d59 cluster in 107624 (0 part-0 muster rows, 8
  holders) is a day fact or a shared holder fact.
- Whether `pick-early-return` days (REST/EAT/SEEK) are a large share
  of the never-scored set — if so, the dawn body gates, not the
  pool, are the first wall on those days.
- Whether any `unclassified` remainder shares a pattern the extended
  taxonomy still misses (name it for the next arm, do not re-score).
- Whether the replay drifted from the frozen corpus (bar 4) and what
  the drift attributes to.
- Whether the band (107617–107624) changed anything vs the muster-a
  reading (it must not — the band is replayed, not selected).

## 11. Freshness check (record, per the seed-band skill)

- No new band: this arm replays frozen band 107617–107624 by
  design. Freshness was verified by sim-muster-a (prereg §11: zero
  hits for 107617–107669 across all dated preregs + 2026-11-2*
  evidence). Nothing re-banded, nothing re-selected.

## 12. Canon note (read first, per the brief)

Read: `docs/CANON.md`, `docs/MONSTER-WAVES.md` (wave 4/5 gates:
standing ≥ 100 / ≥ 200 + wave-4 faced; readiness bars armored/armed/
tricks/veterans), `docs/PARTY.md` (the player's party system: System
unlock day 7, trust affects acceptance not eligibility, cap 3→4→5).
**No canon doc covers the win-plan muster.** `PARTY.md` is the
player's party, not the win-plan companion pool; the muster mechanism
here is grounded in code only — `villager-brain.js` `winPlanCands` /
`findCompanion`, `win-plan.js` `findCompanion` /
`companionLaunchable` / `extraCompanionScan`, `villager-objectives.js`
`objPick` / `objTick` / `vbrainFeedExtras` — with call text cited in
the proof test. Nothing in the taxonomy is invented canon; where the
code is silent, the taxonomy says `unclassified` and counts it
unclassified rather than guessing.

## AMENDMENT 1 — determinism replay (written 2026-11-23 ~21:00 UTC, BEFORE any band judgment, per §7 step 2)

`--diff` frozen dir vs replay dir (2 pilot seeds, subset dirs
/tmp/frozen-2seed vs /tmp/replay-2seed): literal match 0/2,
DIFF_EXIT=1. The mismatch is NOT game/substrate drift. Field-by-field:

- GAME REPRODUCTION FIELDS IDENTICAL on both seeds: launches (0 /
  29), days (150 / 150), musterDays (12 / 97), totalEvents (35 / 532),
  askKindCounts (equal), scored-half causes (holder-not-scored 19 /
  424, pool-empty:away 2 / 35, pool-empty:notRanger 10 / 22), and the
  neverScored day/vid/stage/target SETS identical (23 / 475 rows).
- ONLY causeCounts differ, in the naming direction only: the frozen
  corpus analyzed by the NEW analyzer leaves 3 + 18 unclassified;
  the replay names all of them (unclassified 0 / 0). New names from
  the dawn streams: 107617 — 1 holder-away-at-dawn, 2
  pick-early-return; 107624 — 6 holder-away-at-dawn, 4
  holder-on-expedition-at-dawn, 7 pick-early-return, 1
  objective-live-all-day. (The frozen corpus analyzed by the new
  analyzer already named 33 scholar-at-dawn days on 107624 via
  daily.scholarId and 1 plan-created day on 107617 — the instrument
  extension, not the game, is what changed.)
- Cause of the diff: the frozen corpus has no dawnState /
  objPickLog / objTickTrace / refreshLog streams, so causes 2c–2i
  cannot fire on it. This is the instrument's intended effect (§5b),
  not a substrate difference (§0b predicted none, and the identical
  game fields confirm none).
- JUDGED SET: the replay's never-scored set. It coincides with the
  frozen 82-set (same holder-days, same counts — totalEvents
  identical per seed), so bar 1 is still judged on the same 82
  holder-days, now with the dawn sampler naming them. Bar 4 is
  judged on its substance (game reproduction exact on every
  compared field) with the literal --diff causeCounts mismatch
  recorded here as the expected instrument effect. The fresh 107617
  replay is byte-identical to the inherited 107617 replay file
  (verified with cmp), and the proof test's D1 leg already showed
  identical dawn rows across replays.

## 13. Findings update (for the coordinator to append)

[UPDATE] to the 82-holder-days finding in
`hidden_files/sim-findings.md` (line 2719) — the coordinator appends
the verdict from the evidence file; this arm writes the update text
as a section in `evidence/2026-11-23/sim-musterask-a.md` and states
it verbatim in its final report. This arm does NOT edit files
outside its worktree.
