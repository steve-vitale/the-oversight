# sim-deathcleanup-b — PREREG (binding)

Run: fleshout-loop-b-20261117T0830Z (Loop B), axis winnability chain, arm
sim-deathcleanup-b — BUILD: death cleanup in `win-plan.js` (the named lever
from sim-deadplan-b DIAG GO/COSTLY). Branch `sim-deathcleanup-b` (worktree
`~/workspace/worktrees/sim-deathcleanup-b`). Base: master
`21e7b750a9d3e1c124f891b67c6a59381ee204c5` at arm start (the worktree HEAD).
Binding prereg: THIS file — frozen before any judged sim. The instrument
(driver wrapper, analyzer, proof test) is built AFTER this commit; the
fix is built AFTER the control legs run; no judged numbers exist yet.
Commit this file FIRST (`scripts/safe-commit.sh "sim-deathcleanup-b:
frozen prereg — ..."`), then build.

## The question, in plain words

A villager starts a win-plan (gear up, gather a party, walk out and hunt
the beasts the village needs dead). The villager dies. The plan does not
die with them: the only `delete v.winPlan[vid]` in the code is the
table-active case, and there is NO death cleanup. Deadplan measured the
cost on band 103221–103228: 6 living holders carried a dead villager in
their plan party (149 holder-days); 1,500/2,615 census rows (57%)
belonged to dead holders; 0 launches ever carried a dead member
(launches rebuild the party from the living). This arm BUILDS the fix
deadplan named and measures before/after on identical seeds: does the
cleanup remove the stale refs with no regression?

## Prior art (read first)

- `evidence/2026-11-16/sim-deadplan-b.md` + prereg — the spec. It is the
  DIAG this arm builds from: the slot count (c), the census counts (a)/(d),
  the death-day sourcing rule (deaths array, kind villager/person — the
  roster flag never flips), the static grounding (every live decision path
  filters the dead; the only whole-census read filters too).
- `docs/CANON.md` (read first). CANON GAP (recorded, not invented): no
  CANON-registered doc covers winPlan lifecycle or death cleanup (checked
  2026-11-17 against the `docs/CANON.md` manifest, same as deadplan).
  The work is grounded only in `src/js/win-plan.js` and that evidence file.
- `docs/MEASUREMENT.md` §§9–12, 14–15.

## The fix (frozen design)

`winPlanOnVillagerDeath(vid)` in `src/js/win-plan.js` (new method,
listed in the file's `provides:`):

- Delete the dead villager's own plan entry (`delete v.winPlan[vid]`).
- Purge that vid from every remaining holder's `plan.party`.
- Stage fallback (the deadplan design detail): when the purge empties a
  living holder's party AND the plan is at `party` or `hunt` stage, the
  plan falls back to `party` (re-seek a companion) rather than sitting
  at `hunt` with an empty list. `standing` / `table` plans keep their
  stage (the kill is banked; the party list is vestigial there); `gear`
  plans keep theirs (party is empty there anyway).
- Bump `winPlanStats.deathCleanups` (new counter, initialized in
  `stateOf` beside the other counters) only when the call actually
  cleaned something (an entry deleted or ≥1 party ref purged), so the
  count is honest and a double-fire is harmless. The method is pure
  data work: no RNG, no `say`, no other Game calls except `stateOf`.
  It returns `{ deleted, purged }` for testability.

Hook sites (frozen — verified in this tree before this commit):

- `removeVillager(vid, how)` (`src/js/betrayal.js:1104`, "the one removal
  choke point"): inside the `if (how === 'killed' || how === 'ambushed')`
  dead-mark block, beside `rec.dead = true`. This is AFTER the phoenix
  early-return at the top of the function, so a phoenix-held death (the
  bearer is dying, not dead; the link resolves later and calls
  `removeVillager('killed')` again) does NOT clean a living villager's
  plan. Every roster-villager death path routes through here:
  `hurtVillager` (lethal hurt), `expedDeath` (villager-agency.js:790),
  contest `_cxKillContestant`, alien murder (alienPlayers.js:2459),
  wound (game.js:29211), thirst (game.js:33056), ash-death
  (game.js:48362), phoenix-aftermath (game.js:48656/48688).
  Non-death removals (`'fled'`, `'splinter'`, `'exiled'`) do NOT fire
  the cleanup — the spec is death only; leavers' lingering plans are a
  separate finding, not this fix.
- `tbVillagerFalls(t)` (`src/js/game.js:40356`): after the roster-membership
  double-death guard. The turn-based fight death funnel bypasses
  `removeVillager` entirely (it removes from the roster directly and
  pushes `fallen`) — a removeVillager-only hook would MISS every TB
  death. Called for Haven villagers (and Haven allies) who fall in a
  TB fight; purging a foreign vid is a no-op (they can never be in a
  Haven plan party: `findCompanion` is roster-only).

NOT hooked (deliberate, frozen):

- `registerDeath` (`src/js/corpses.js`): it is THE death record, and
  the party-formal.js precedent wraps it — but it fires BEFORE
  `removeVillager`'s phoenix decision in the `hurtVillager` path, so a
  phoenix-held death would clean a living villager's plan. The two
  hook sites above fire exactly when death is final, post-refusal.
- No tick, no recorder, no dawn pass: the cleanup runs at the death
  moment, synchronously, in game code — never a background sweep.

Scholar: the scholar cannot hold a winPlan entry — all four creation
paths are NPC-only (agencyTick skips `villagerId`; the world-tick
router targets NPCs on the monster's node, never the scholar's node;
the dawn executor and launch companions are NPCs). No playerDeath
hook is needed; the method itself is vid-generic if one ever appears.

## Instrument (frozen)

Reuse the deadplan instrument, not a rebuild:

- `scripts/deathcleanup-driver-20261117.js` — thin wrapper over
  `scripts/deadplan-driver-20261117.js` (`oneRun`, recorder ON on BOTH
  legs). It sets env before requiring the driver and writes per-seed
  JSON to `evidence/2026-11-17/perseed-deathcleanup-b-{control,armed}/`
  with `RUN=deathcleanup-b-{control,armed}`, `MODE=on`, `DAYS=150`.
  The deadplan driver/analyzer/test files are NOT modified; if the
  analyzer needs a change, it gets a correction commit and the change
  is stated in the evidence.
- `scripts/analyze-deathcleanup-b.js` — requires
  `scripts/analyze-deadplan-b.js` (`classify`, `summarizeLeg`,
  `analyzeOne`) and reports BOTH legs classified by the frozen
  deadplan bar-3 rule, plus the before/after comparison and the cost
  bars. It also runs the drift smoke (below).
- Drift smoke (D3): `vetparty-drift-check.js` logic, adapted in the
  analyzer with `firstLeverDay` = the first villager/person death day
  in the leg (the earliest day the cleanup could act — NOT the first
  v4seed day, which is a different lever's earliest day). Any daily
  fingerprint divergence BEFORE that day is substrate drift, not a
  lever effect, and fails the run.
- `scripts/test-deathcleanup-b.js` — proof: static checks (method
  exists, both hook sites call it, no other `winPlan` delete added),
  unit fixtures (delete + purge + stage fallback + stat bump +
  idempotency + no-op for a vid with no plan), live integration
  (lethal `hurtVillager` deletes the plan via the removeVillager hook;
  `tbVillagerFalls` deletes it via the TB hook; a phoenix-held death
  keeps the plan — or the test documents why that fixture cannot be
  built), D1 determinism (armed code twice, 60d, seed 103231,
  identical full corpus), and a 150d live run proving the cleanup
  fires in sims (`winPlanStats.deathCleanups` > 0).

Legs (both with the recorder ON — the game change is the lever, not
the recorder):

- CONTROL leg — the worktree BEFORE the fix commit (base
  `21e7b750a`), 8 seeds, 150d, competent verbatim. Proves the band
  carries the defect (bar 2).
- ARMED leg — the worktree AFTER the fix commit, same 8 seeds, same
  policy/horizon. Proves the fix removes it (bar 1) with no regression
  (bar 3).
- VETREENGAGE is OFF in these sims (env unset) — same as deadplan, so
  the VETREENGAGE dissolution branch and trio path do not fire.

## Primary metric + GO bars (frozen)

Primary metric: **stale party refs and dead-holder census rows on the
armed leg vs the control leg, with the cost bars behind them.**

GO (BUILD GO = fix works + no regression) iff ALL hold:

1. **Armed leg clean.** Slot (c-i) holder-days 0 AND dead-holder
   census rows (a) 0 on all 8 armed seeds (the deadplan analyzer's
   counts, same definitions). `winPlanStats.deathCleanups` > 0 band-wide
   (the hook fired in live sims, not just in fixtures).
2. **Control leg reproduces the defect.** Slot (c-i) holder-days > 0
   OR dead-holder census rows > 0 on the control leg — the band must
   carry the defect, or the armed leg's zero proves nothing.
3. **Cost bars — no regression.** Armed vs control, band totals:
   launches (v4departs `launch`) within ±2; wave-4 kills within ±4;
   starvation deaths (deaths kind villager with cause starvation /
   hunger — counted the same way on both legs) within ±3; median
   survival within ±10 days. Any bar missed = REGRESSION: gate the
   fix (env gate, default OFF) and report it plainly — the ship call
   below flips to gated.
4. **Proof green + drift clean + panel attached.** `scripts/test-deathcleanup-b.js`
   green (including D1); drift smoke shows no divergence before the
   first death day on any seed; the balanced-panel compare `.md` is
   attached (see §Balanced panel) and its decision is
   `no_material_signal`, or a material signal is investigated and
   explained in the evidence (a regression signal there fails this bar).
5. **Wall numbers on both legs**: national by standing ≥200, national
   by scaleRank, table, wins, wave-4 unlocks, wave-5 unlocks, median
   survival, wave-4 kills, deaths.

The VERDICT is the armed-leg cleanliness plus the cost bars. A BUILD
GO means the fix ships as a direct fix (no env gate). A miss on bar 3
or 4 means the fix ships gated (default OFF) or not at all, per the
ship call below — never silently.

## Ship call (frozen)

Direct fix, NO env gate — unless the before/after shows ANY regression
(bar 3 or 4), in which case gate it, keep default OFF, and report the
regression plainly. The evidence file states which call was taken and
why. (Same rule as the brief.)

## Seed bands (fresh — verified, not reused)

- Band: **103231–103238** (8 seeds), control leg first (pre-fix),
  then armed leg (post-fix), identical seeds, same policy/horizon.
- FRESH: per-seed `grep -rl` over `evidence/*/sim-*-prereg.md` AND
  `evidence/*/sim-*.md` returns 0 files for every seed in the band
  (verified 2026-11-17 in the worktree); `grep -rl "10323"` over the
  live claim files in
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/lever-claims/`
  returns nothing; the band is in no earlier arm's forbidden list
  (deadplan's list carried over: NEVER 100621–100636, 100861–100868,
  100821–100828, 100721–100728, 100761–100768, 10100–10139,
  190391–190398, 190621–190628, 190631–190638, 190541–190548,
  190561–190568). The candidate band 103231–103238 from the brief
  verified clean — no collision, no alternate band needed.
- This is a fresh screening band; there is no cross-band comparison in
  this arm — both legs run this band only.

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js`
  — sha256
  `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`,
  verified in the worktree before this commit — matches the brief's
  pin, no re-pin needed).
- Control anchor = the prereg commit (base `21e7b750a` + prereg +
  instrument, recorder ON); armed anchor = the fix commit (same +
  the `win-plan.js` / `betrayal.js` / `game.js` change). No seed call
  anywhere in this arm; the only `src/` change between legs is the
  fix itself.

## Sense-testing (mandatory)

Read transcripts. Read the per-holder stories on the CONTROL leg: for
every dead holder whose plan lingers ≥30 days, say who they were, when
and how they died, what their plan was (stage, target, party), and
whether anything in the village's talk or behavior ever treated the
dead holder as still planning. On the ARMED leg, read the same
villages' talk around the same deaths: does any line treat a dead
holder as still planning, or name a dead companion as still walking
with the living? One such line is a finding, not a rounding error —
name it in the evidence. Also read the `vetSays` lines for the dead
holders' last days.

## Balanced panel (per docs/MEASUREMENT.md §15)

The panel IS run for this BUILD arm (unlike the recorder-only DIAGs):
it is the before/after cross-check on 4 policies × 16 seeds × 150d.

- Base panel: `node scripts/balance-panel.js --n 16 --days 150 --out
  evidence/2026-11-17/deathcleanup-panel-before` — run from this
  worktree BEFORE the fix commit (control `src/`).
- Lever panel: same command with `--out
  evidence/2026-11-17/deathcleanup-panel-after` — run AFTER the fix
  commit (armed `src/`).
- Compare: `node scripts/balance-panel.js compare --before
  evidence/2026-11-17/deathcleanup-panel-before/panel.json.gz --after
  evidence/2026-11-17/deathcleanup-panel-after/panel.json.gz --out
  evidence/2026-11-17/deathcleanup-b-panel` — the compare `.md` is
  attached to the evidence file. No legacy sweep env overrides
  (`SEEDS`/`POLICIES`/`DAYS`/`REGION`/`ORIGIN` unset) during panel
  runs; no `src/` edits during a panel run (the panel's sourcesStable
  check fails otherwise).
- If panel compute fails or overruns the run, record the deviation
  with the exact follow-up commands (companionguard precedent) —
  do not silently skip it, do not fake a compare.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-17/perseed-deathcleanup-b-armed/*.json'
--metrics national,table,wins,exiled`. Record the outcome (including
a documented refusal) — do not work around a refusal. (Deadplan's
recorder-corpus refusal is NOT expected here: these are run rows
with the game change, not recorder corpora — but if it refuses,
record it as deadplan did.)

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Did the control leg reproduce the deadplan defect on this fresh
  band (bar 2), or is the band defect-free (empty seeds, no plans)?
- Did any death bypass BOTH hook sites (a planCensus row for a dead
  holder on the armed leg, or a deaths-array row with no cleanup)?
  Name the path — a bypass is a finding, not a rounding error.
- Did the stage fallback (`hunt` → `party` on empty) fire in the
  armed leg, and did any holder re-seek a companion afterwards?
- Did the TB hook fire in sims (TB deaths are player-present; the
  competent policy may produce few or none)? If zero TB deaths
  occurred, the TB hook is fixture-proven only — say so.
- Was 150d the right horizon, or did the cost bars need the full run
  to separate from noise?
- Did the panel agree with the paired legs, or disagree (and why)?

## Wall numbers (report every run)

National (standing ≥200 AND scaleRank), table, wins, wave-4
unlocked, wave-5 unlocked, median survival, wave-4 kills, deaths —
per leg.
